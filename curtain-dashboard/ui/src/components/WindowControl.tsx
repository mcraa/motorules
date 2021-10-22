import React, { useEffect, useState } from 'react';

import {
  CardContent, 
  CardHeader, 
  Slider,
} from '@material-ui/core';
import {
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
} from '@material-ui/icons';
import { 
  Button,
  ButtonGroup,
  Card,
  Txt
} from 'rendition'

import { MotorModel } from '../models';
import { getAllMotors, updateMotorPositionById } from '../services/Api';


function WindowControl() {
    let [percents, setPercents] = useState<{ [index: number]: number }>()
    let [motors, setMotors] = useState<MotorModel[]>()
    let [percentsDisplay, setPercentsDisplay] = useState(percents)

    let updatePercentsDisplay = (name: number, val: number) => {
      let newPercents = { ...percents }
      newPercents[name] = val
      setPercentsDisplay(newPercents);
  }
    
    let updatePercents = async (name: number, val: number) => {
      let updateResult = await updateMotorPositionById(name, { currentPosition: val } as MotorModel) as any
      console.log(updateResult);
      if (updateResult.count === 1) {
        let newPercents = { ...percents }
        newPercents[name] = val
        setPercents(newPercents);
        setPercentsDisplay(newPercents);
      }
    }

    const fetchMotors = async () => { 
      const motors = await getAllMotors() 
      let newP = {} as any
      motors.map(m => {
        newP[m.id] = m.currentPosition
        return newP
      })  
      setMotors(motors)
      setPercents(newP)
      setPercentsDisplay(newP)
    }

    let getPercent = (id: number) => percents && percents[id] ? percents[id] : 0
    let getPercentDisplay = (id: number) => percentsDisplay && percentsDisplay[id] ? percentsDisplay[id] : 0
  
    useEffect(() => {
      fetchMotors();
    }, [])
    
    return(
      <div>
        <h1>Window</h1>
        {motors?.length === 0 ? 
          <Card backgroundColor='#2d333b' marginBottom='15px'>
            <CardHeader title="No motors defined yet." />
            <Txt>
              Add motors on the 'Motors' page
            </Txt>
          </Card>
        : '' }
        {motors?.map((motor, i) => (
          <Card key={i} backgroundColor='#2d333b' marginBottom='15px'>
            <CardHeader title={`${motor.name} @ ${Math.round(getPercent(motor.id))}%`} />
            <CardContent>
              <Slider
                value={getPercentDisplay(motor.id)}
                valueLabelFormat={(val) => Math.round(val)}
                aria-labelledby="discrete-slider-small-steps"
                step={motor.stepLength / motor.fullDistance * 100}
                marks
                min={1}
                max={100}
                valueLabelDisplay="auto"
                onChange={(e,v) => updatePercentsDisplay(motor.id, +v)}
                onChangeCommitted={(e, v) => updatePercents(motor.id, +v)}
              />
                <ButtonGroup style={{justifyContent: 'center'}}>
                  <Button 
                    onClick={() => updatePercents(motor.id, getPercent(motor.id) - (motor.stepLength / motor.fullDistance * 100))}
                  >
                    <IconArrowLeft />
                  </Button>
                  <Button 
                    onClick={() => updatePercents(motor.id, getPercent(motor.id) + (motor.stepLength / motor.fullDistance * 100))}
                  >
                    <IconArrowRight />
                  </Button>
                </ButtonGroup>
            </CardContent>
          </Card>
        ))}
        
      </div>
    );
}

export default WindowControl