from backend.rl.train import train_agent
from backend.core.logging import logger

def main():
    logger.info("Initializing Agent Training Trigger...")
    train_agent()

if __name__ == "__main__":
    main()
