from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_create_user_missing_fields():

    response = client.post(
        "/users",
        json={}
    )

    assert response.status_code == 422


def test_get_users():

    response = client.get("/users")

    assert response.status_code == 200

    assert isinstance(
        response.json(),
        list
    )