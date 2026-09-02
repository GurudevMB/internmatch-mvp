from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_internships():

    response = client.get(
        "/internships"
    )

    assert response.status_code == 200

    assert isinstance(
        response.json(),
        list
    )


def test_get_invalid_internship():

    response = client.get(
        "/internships/999999"
    )

    assert response.status_code == 404