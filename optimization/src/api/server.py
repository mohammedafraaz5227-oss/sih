from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.models import (
    OptimizationRequest,
    OptimizedSchedule,
    ScheduleComparison,
    DisruptionSimulationRequest,
    DisruptionSimulationResponse,
    NLPParsingRequest,
    NLPParsingResponse,
)
from src.solver import (
    BlockPlanningEngine,
    SolverConfig,
    ScheduleComparator,
)
from src.data import (
    generate_demo_data,
    generate_congested_data,
)
from src.copilot import (
    parse_nlp_requisition,
    simulate_corridor_disruption,
)

app = FastAPI(
    title="SIH Block Planner — Optimization Service",
    description="AI-powered maintenance block scheduling using CP-SAT and Generative AI Co-Pilot. Uses demo data only.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "block-planner-optimizer", "milestone": "2.0"}


@app.post("/optimize", response_model=OptimizedSchedule)
def optimize(request: OptimizationRequest):
    """Run optimization on user-provided data."""
    solver_config = SolverConfig(**(request.config or {}))
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(request)
    return engine.solve()


@app.post("/optimize/demo", response_model=OptimizedSchedule)
def optimize_demo():
    """Run optimization on the baseline synthetic demo data (5 assets, 8 trains, 8 blocks)."""
    request = generate_demo_data()
    engine = BlockPlanningEngine()
    engine.build_model(request)
    return engine.solve()


@app.post("/optimize/congested", response_model=OptimizedSchedule)
def optimize_congested():
    """Run optimization on the deliberately congested corridor scenario (11 trains, 10 blocks, 2 crews)."""
    request = generate_congested_data()
    solver_config = SolverConfig(**(request.config or {}))
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(request)
    return engine.solve()


@app.post("/compare/congested", response_model=ScheduleComparison)
def compare_congested():
    """Run side-by-side comparison: Naive Baseline Plan vs CP-SAT Optimized Plan on congested data."""
    request = generate_congested_data()
    solver_config = SolverConfig(**(request.config or {}))
    comparator = ScheduleComparator(config=solver_config)
    return comparator.compare(request, scenario_name="Deliberately Congested Delhi-Agra Corridor")


@app.post("/compare", response_model=ScheduleComparison)
def compare(request: OptimizationRequest):
    """Run side-by-side comparison: Naive Baseline Plan vs CP-SAT Optimized Plan on provided data."""
    solver_config = SolverConfig(**(request.config or {}))
    comparator = ScheduleComparator(config=solver_config)
    return comparator.compare(request, scenario_name="Corridor Operational Benchmark")


@app.post("/api/disruption/simulate", response_model=DisruptionSimulationResponse)
@app.post("/disruption/simulate", response_model=DisruptionSimulationResponse)
def simulate_disruption_endpoint(request: DisruptionSimulationRequest):
    """Simulate a real-world delay or emergency block and re-run CP-SAT optimization."""
    return simulate_corridor_disruption(request)


@app.post("/api/nlp/parse", response_model=NLPParsingResponse)
@app.post("/nlp/parse", response_model=NLPParsingResponse)
def parse_nlp_endpoint(request: NLPParsingRequest):
    """Parse field engineer voice/text requisition notes into structured BlockRequest constraints."""
    return parse_nlp_requisition(request.text)

