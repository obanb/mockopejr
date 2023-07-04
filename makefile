cli_run:
    yarn run cli run $(filter-out $@,$(MAKECMDGOALS))
