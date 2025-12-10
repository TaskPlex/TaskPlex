from app.services.uuid_service import generate_uuids


def test_generate_uuids_success():
    res = generate_uuids(count=3)
    assert res.success is True
    assert len(res.uuids) == 3


def test_generate_uuids_invalid_version():
    res = generate_uuids(version="v1", count=1)
    assert res.success is False
    assert "only uuid v4" in res.message.lower()


def test_generate_uuids_invalid_count():
    res = generate_uuids(count=0)
    assert res.success is False
    assert "between 1 and 50" in res.message.lower()
