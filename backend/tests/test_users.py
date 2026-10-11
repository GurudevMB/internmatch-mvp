from types import SimpleNamespace

from fastapi.testclient import TestClient

from main import app, get_current_user

client = TestClient(app)


def test_create_user_missing_fields():
    response = client.post("/users", json={})
    assert response.status_code == 422


def test_get_users_without_token():
    response = client.get("/users")
    assert response.status_code == 401


def test_get_users_rejects_non_admin():
    app.dependency_overrides[get_current_user] = (
        lambda: SimpleNamespace(role="student")
    )

    try:
        response = client.get("/users")

        assert response.status_code == 403
        assert response.json()["detail"] == "Admin access required"
    finally:
        app.dependency_overrides.pop(get_current_user, None)