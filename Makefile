.PHONY: install run-backend run-frontend train evaluate test clean

install:
	pip install -r requirements.txt
	cd frontend && npm install

run-backend:
	python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

run-frontend:
	cd frontend && npm run dev

train:
	python scripts/train_agent.py

evaluate:
	python scripts/evaluate_agent.py

test:
	python -m pytest tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf .pytest_cache
