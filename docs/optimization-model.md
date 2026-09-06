# AI-Powered Automated Block Planning: Mathematical Optimization Model

This document outlines the formal mathematical formulation of the railway maintenance block planning engine powered by Google OR-Tools CP-SAT (Constraint Programming - Satisfiability).

---

## 1. Problem Overview & Operational Context

In busy railway corridors, infrastructure maintenance (track renewal, OHE catenary repair, ultrasonic rail flaw inspection, signaling overhauls) must occur on physical tracks while passenger and freight traffic continues to operate.

A fundamental conflict arises:
* **Train Operations** require guaranteed, punctual access to track sections with stringent safety separation (headways).
* **Maintenance Divisions** require exclusive physical track possession (blocks) and specialized maintenance crews.

The challenge is to generate a conflict-free maintenance block schedule over a planning horizon that:
1. Completely avoids disrupting timetabled train movements.
2. Respects inviolable headway safety buffers.
3. Accommodates high-priority and emergency repairs first.
4. Minimizes schedule shifts away from requested engineering windows.
5. Strictly adheres to available maintenance crew capacities.

---

## 2. Decision Variables & Formulation

### Horizon & Time Discretization
* Planning horizon: $\mathcal{H} = [0, T_{\text{max}}]$, discretized into integer minutes from midnight ($T_{\text{max}} = 1440$ for a 24-hour cycle).
* Track Sections (Assets): $\mathcal{S} = \{s_1, s_2, \dots, s_M\}$.

### Train Movements (Immovable Intervals)
Let $\mathcal{T}$ be the set of scheduled train movements. For each train $t \in \mathcal{T}$ traversing track section $s \in \mathcal{S}$ with nominal entry time $\tau^{\text{arr}}_{t,s}$ and exit time $\tau^{\text{dep}}_{t,s}$:
* A fixed occupancy interval $I^{\text{train}}_{t,s}$ is constructed with safety headway buffer $B_{\text{safety}}$ (default 15 minutes):
  $$\text{start}(I^{\text{train}}_{t,s}) = \max(0, \tau^{\text{arr}}_{t,s} - B_{\text{safety}})$$
  $$\text{end}(I^{\text{train}}_{t,s}) = \min(T_{\text{max}}, \tau^{\text{dep}}_{t,s} + B_{\text{safety}})$$
  $$\text{duration}(I^{\text{train}}_{t,s}) = \text{end}(I^{\text{train}}_{t,s}) - \text{start}(I^{\text{train}}_{t,s})$$

### Maintenance Block Requests (Optional Flexible Intervals)
Let $\mathcal{B} = \{b_1, b_2, \dots, b_N\}$ be the set of block requests. Each block $b$ specifies:
* Target track section: $s(b) \in \mathcal{S}$
* Duration: $D_b \in \mathbb{Z}^+$
* Feasible window: $[W^{\text{start}}_b, W^{\text{end}}_b]$
* Preferred start time: $P_b \in [W^{\text{start}}_b, W^{\text{end}}_b - D_b]$
* Priority tier: $\pi_b \in \{1, 2, 3, 4, 5\}$ (Low, Medium, High, Critical, Emergency)
* Crew demand: $c_b \in \mathbb{Z}^+$

For each request $b \in \mathcal{B}$, the solver decides:
1. **$start_b \in [W^{\text{start}}_b, W^{\text{end}}_b - D_b]$**: Integer start time.
2. **$end_b = start_b + D_b$**: Integer completion time.
3. **$presence_b \in \{0, 1\}$**: Boolean indicator variable. If $presence_b = 1$, block $b$ is approved and scheduled; if $presence_b = 0$, block $b$ is deferred/skipped due to network congestion.
4. **$interval_b$**: Optional CP-SAT interval variable linked to $(start_b, D_b, end_b, presence_b)$.

---

## 3. Constraints

### 1. Time Window Bounds
$$\text{start}_b \ge W^{\text{start}}_b, \quad \text{end}_b \le W^{\text{end}}_b \quad (\text{enforced conditionally when } presence_b = 1)$$

### 2. Disjunctive Track Section Conflict Avoidance (`AddNoOverlap`)
On any track section $s$, maintenance blocks and trains cannot physically occupy the track simultaneously:
$$\text{NoOverlap}\Big(\{I^{\text{train}}_{t,s} \mid t \in \mathcal{T}\} \cup \{interval_b \mid b \in \mathcal{B}, s(b) = s\}\Big) \quad \forall s \in \mathcal{S}$$
Because train intervals are fixed, the CP-SAT propagation engine forces maintenance blocks into empty gaps ("traffic windows") between trains.

### 3. Cumulative Crew Capacity (`AddCumulative`)
The total maintenance workforce deployed at any minute $t \in [0, T_{\text{max}}]$ cannot exceed the divisional crew capacity $C_{\text{max}}$:
$$\sum_{b \in \mathcal{B} \mid presence_b = 1 \land start_b \le t < end_b} c_b \le C_{\text{max}} \quad \forall t \in \mathcal{H}$$

---

## 4. Representation of Train Impact & Objective Function

### How Train Disruption is Represented in CP-SAT
In real-world railway dispatching, train disruption can be represented in two paradigms:
1. **Hard Preservation (Adopted in CP-SAT Engine)**: Train schedules and safety headways are treated as inviolable hard constraints ($0$ train conflicts permitted). Any block that would cause a train conflict is mathematically prohibited from being scheduled at that time. Disruption is minimized by:
   - **Shifting** the block to an idle gap: penalizes the objective via deviation penalty $W_{\text{dev}} \times |start_b - P_b|$.
   - **Skipping** the block if no conflict-free gap exists within its window: penalizes the objective by forfeiting the priority reward $\pi_b \times W_{\text{base}}$.
2. **Soft Violation Penalty (Used in Naive Baseline & Audit Evaluation)**: When evaluating unoptimized plans that place blocks at requested times, each direct train conflict incurs a heavy penalty $W_{\text{train\_conflict}} = 25,000$ and an accumulated detention penalty $W_{\text{delay}} = 50 \text{ / min}$.

### Multi-Objective Mathematical Formulation
The solver maximizes the following composite objective:

$$\max \mathcal{Z} = \sum_{b \in \mathcal{B}} \left( \pi_b \times W_{\text{base}} \times presence_b \right) - \sum_{b \in \mathcal{B}} \left( W_{\text{dev}} \times \delta_b \right)$$

Where:
* $\delta_b = |start_b - P_b|$ when $presence_b = 1$, and $\delta_b = 0$ when $presence_b = 0$.
* $W_{\text{base}} = 10,000$ (rewards scheduling higher-priority maintenance: Emergency $P5 = 50,000$, Critical $P4 = 40,000$, High $P3 = 30,000$, Medium $P2 = 20,000$, Low $P1 = 10,000$).
* $W_{\text{dev}} = 10 \text{ / min}$ (penalizes shifting away from preferred start times).

To maintain linearity in CP-SAT without nonlinear products, deviation is modeled using conditional integer variables:
$$\text{diff}^{\text{pos}}_b \ge start_b - P_b \quad (\text{enforced if } presence_b = 1)$$
$$\text{diff}^{\text{neg}}_b \ge P_b - start_b \quad (\text{enforced if } presence_b = 1)$$
$$\delta_b \ge \text{diff}^{\text{pos}}_b, \quad \delta_b \ge \text{diff}^{\text{neg}}_b \quad (\text{enforced if } presence_b = 1)$$
$$\delta_b = 0 \quad (\text{enforced if } presence_b = 0)$$

---

## 5. Naive Baseline vs CP-SAT Benchmark Comparison

To rigorously evaluate the optimization engine, a **Naive Baseline Scheduler** is implemented alongside CP-SAT:

### Naive Scheduler Mechanics
* For every block request $b$, sets $start_b = P_b$ and $end_b = P_b + D_b$ with $presence_b = 1$.
* Performs zero conflict detection or shifting.
* Evaluates all operational violations:
  - **Train Conflicts**: Direct temporal overlap between $[start_b, end_b]$ and any train's buffered window $[t^{\text{start}}, t^{\text{end}}]$ on section $s(b)$.
  - **Estimated Train Delay**: $\sum \max(0, end_b - t^{\text{start}})$ for all overlapping trains.
  - **Resource Violations**: Count of time intervals where $\sum c_b > C_{\text{max}}$.
  - **Naive Objective Score**:
    $$\mathcal{Z}_{\text{naive}} = \sum (\pi_b \times W_{\text{base}}) - W_{\text{train\_conflict}} \cdot (\text{conflicts}) - W_{\text{delay}} \cdot (\text{delay}) - W_{\text{resource}} \cdot (\text{crew violations})$$

### Benchmark Comparison on Congested Corridor (Milestone 1.5)

| Metric | Naive Baseline Plan | CP-SAT Optimized Plan | Improvement / Impact |
|:---|:---:|:---:|:---|
| **Blocks Scheduled / Requested** | 10/10 | 6/10 | 6 feasible blocks accommodated |
| **Blocks Skipped (Infeasible)** | 0 | 4 | Lower priorities safely deferred |
| **Train Conflicts** | **12 direct conflicts** | **0** | **-12 (100% eliminated)** |
| **Estimated Train Delay** | **1,235 mins** | **0 mins** | **-1,235 mins delay eliminated** |
| **Affected Trains** | 5 premier trains | 0 trains | Vande Bharat, Rajdhani 100% on time |
| **Total Block Deviation** | 0 mins (blind) | 425 mins | Intelligent conflict-free shifts |
| **Asset Downtime** | 1020 mins (14.2%) | 600 mins (8.3%) | 100% conflict-free downtime |
| **Resource / Crew Conflicts** | 1 (peak 5/2 crews) | 0 (peak $\le 2$ crews) | 100% workforce compliance |
| **Overall Objective Score** | **-96,750.0** | **+195,750.0** | **+292,500.0 improvement** |
| **Solver Runtime** | 0.0001s | 0.0066s | Solved to optimality in 6ms |

---

## 6. Extensibility for Future Milestones

1. **Route-Level & Junction Conflicts**: Incorporate station yard throat routes and interlocking route incompatibility matrices into disjunctive cliques.
2. **Traction Power (OHE) Shadow Blocks**: Synchronize automatic power shutdowns on parallel or crossover lines when an energized block is scheduled.
3. **Rolling Re-planning**: Warm-start CP-SAT using previous solution hints (`model.AddHint`) when real-time train delays occur mid-day.
