import logging
import time
from wsgiref import simple_server
import falcon
import board   
from adafruit_motorkit import MotorKit
from adafruit_motor import stepper

#to activate the motor
def turn_motor(logger: logging.Logger, doc):
    logger.error(doc)
    
    steps = doc.get('steps')
    motorNo = doc.get('motor')
    #layerNo = doc.get('layer')

    board_i2c = board.I2C()
    devices = board_i2c.scan()
    logger.error(devices)
    
    kit = MotorKit(i2c=board_i2c) # TODO: use layerNo and motorNo

    stepperName = "stepper" + str(motorNo)
    stepperMotor = getattr(kit, stepperName)

    dir = stepper.FORWARD
    if steps < 0:
        dir = stepper.BACKWARD
        steps = abs(steps)

    for _ in range(steps):        
        stepperMotor.onestep(direction=dir)
        time.sleep(0.01)

class MotorsResource:

    def __init__(self):
        self.logger = logging.getLogger('motor-driver.' + __name__)    

    def on_post(self, req, resp):
        try:
            doc = req.get_media()
            turn_motor(self.logger, doc)

        except AttributeError:
            raise falcon.HTTPBadRequest(
                title='Error',
                description='Something went wrong.')

        resp.status = falcon.HTTP_201

app = falcon.App()

motors = MotorsResource()
app.add_route('/', motors)

if __name__ == '__main__':
    httpd = simple_server.make_server('', 8070, app)
    httpd.serve_forever()