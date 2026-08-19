from backend.rl.evaluate import evaluate_agent
from backend.core.logging import logger

def main():
    logger.info("Initializing Agent Evaluation Trigger...")
    evaluate_agent()

if __name__ == "__main__":
    main()
