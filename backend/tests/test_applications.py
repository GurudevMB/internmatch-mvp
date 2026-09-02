from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_applications_without_token():

    response = client.get(
        "/applications"
    )

    assert response.status_code in [
        401,
        403
    ]


def test_create_application_without_token():

    response = client.post(
        "/applications",
        json={
            "user_id": 1,
            "internship_id": 1
        }
    )

    assert response.status_code in [
        401,
        403
    ]