from src.data.synthetic import generate_demo_data

def test_generate_demo_data_validity():
    req = generate_demo_data()
    
    assert len(req.assets) > 0
    assert len(req.trains) > 0
    assert len(req.block_requests) > 0
    
    asset_ids = {a.id for a in req.assets}
    
    for train in req.trains:
        for sec in train.sections:
            assert sec.asset_id in asset_ids
            assert 0 <= sec.entry_time <= 1440
            assert 0 <= sec.exit_time <= 1440
            
    for block in req.block_requests:
        assert block.asset_id in asset_ids
        assert 0 <= block.earliest_start <= 1440
        assert 0 <= block.latest_end <= 1440
        assert block.duration_minutes <= (block.latest_end - block.earliest_start)
