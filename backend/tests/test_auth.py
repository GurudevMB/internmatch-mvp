from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_login_invalid_user():

    response = client.post(
        "/login",
        json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401


def test_login_missing_fields():

    response = client.post(
        "/login",
        json={}
    )

    assert response.status_code == 422


def test_health():

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "OK"