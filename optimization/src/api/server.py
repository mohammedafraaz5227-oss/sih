from fastapi import FastAPI
from src.models import (
    OptimizationRequest,
    OptimizedSchedule,
    ScheduleComparison,
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

app = FastAPI(
    title="SIH Block Planner — Optimization Service",
    description="AI-powered maintenance block scheduling using CP-SAT. Uses demo data only.",
    version="0.2.0",
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "block-planner-optimizer", "milestone": "1.5"}


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
