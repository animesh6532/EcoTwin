from backend.core.config import settings

def get_ppo_hyperparameters() -> dict:
    return {
        "learning_rate": settings.LEARNING_RATE,
        "n_steps": settings.N_STEPS,
        "batch_size": settings.BATCH_SIZE,
        "n_epochs": 10,
        "gamma": settings.GAMMA,
        "gae_lambda": 0.95,
        "clip_range": 0.2,
        "ent_coef": 0.01,
        "vf_coef": 0.5,
        "max_grad_norm": 0.5,
        "verbose": 1
    }
