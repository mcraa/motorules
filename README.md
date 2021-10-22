## Motor Rules *- for curtains*

![logo](images/logo.png)

The `sensor` folder is a `git submodule` containing the [balenaSense repo](https://github.com/balenalabs/balena-sense), make sure you update submodules after cloning.

For this use case two more blocks were added on top of the sense.

1. `curtain-dashboard` to manage your rules
2. `motor-driver` for signaling the stepper motors

The `motor-driver` is created to work with [Adafruit motorHAT](https://www.adafruit.com/product/2348) and uses [their pyton library](https://circuitpython.readthedocs.io/projects/motorkit/en/latest/) to drive the motors.

## Outcome and usage

See the pictures in the `images` folder to check the [hardware](images/hw.jpg) or the [usage of the app](images/screenshots)