import React, { useState, useEffect } from 'react';
import { MotorModel, NewRuleModel, RuleModel } from '../models';
import { ApiError, createRule, deletelRuleById, getAllMotors, getAllRules, getSensorData } from '../services/Api';

import cronParser from 'cron-parser'

import { CardHeader } from '@material-ui/core';
import {
  Accordion,
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  Select,
  Txt
} from 'rendition'
import { 
  Add as IconPlus,
  DeleteForever as IconDelelete
} from '@material-ui/icons'

function Rules() {
  let [rules, setRules] = useState<RuleModel[]>()
  let [motors, setMotors] = useState<MotorModel[]>([])
  let [sensors, setSensors] = useState<string[]>([])
  let [addDialog, setAddDialog] = useState(false)
  let [showSnackBar, setShowSnackBar] = useState(false)
  let [snackBarMessage, setSnackBarMessage] = useState("")
  let [newRule, setNewRule] = useState<NewRuleModel>({ above: false } as NewRuleModel)

  const fetchRules = async () => { 
    const rules = await getAllRules()
    setRules(rules)
  }

  const fetchMotors = async () => { 
    const motors = await getAllMotors()    
    setMotors(motors)
  }

  const fetchSensors = async () => { 
    const data = await getSensorData()
    let sensors = Object.keys(data).filter(v => v !== 'server_time')
    sensors.push('cron')
    setSensors(sensors)
  }

  useEffect(() => {
    fetchRules();
    fetchMotors();
    fetchSensors();
  }, [])

  useEffect(() => {
    if (showSnackBar) {
      setTimeout(() => {
        handleCloseSnackbar();
      }, 6000);  
    }
  }, [showSnackBar]);

  let openAddRule = () => {
    setAddDialog(true)
  }

  let closeAddRule = () => {
    setAddDialog(false)
  }

  let handleFormUpdate = (propName: keyof NewRuleModel, value: string | boolean | number) => {
    let updated: any = { ...newRule } 
    updated[propName] = value
    setNewRule({ ...updated })
  }

  let submitAddRule = async () => {
    if (newRule.sensor === 'cron') {
      try {
        const cronTime = parseCron(newRule.treshold)
        console.log(cronTime);
        
      } catch (error: any) {
        closeAddRule()
        handleShowSnackBar(`Invalid cron pattern: ${error.message}`)
        return;
      }
    }
    const createResponse = await createRule(newRule);
    if ((createResponse as ApiError).error) {
      closeAddRule();
      handleShowSnackBar((createResponse as ApiError).error)
    } else {
      closeAddRule();
      handleShowSnackBar("Added");
      fetchRules()
    }
  }

  let handleShowSnackBar = (message: string) => {
    setSnackBarMessage(message);
    setShowSnackBar(true)
  }

  let handleCloseSnackbar = () => {
    setSnackBarMessage('')
    setShowSnackBar(false)
  }

  let deleteRule = async (id: number) => {
    await deletelRuleById(id);
    // refresh the ui
    await fetchRules()
  }

  let parseCron = (pattern: string) => {
    const cronTime = cronParser.parseExpression(pattern)
    return cronTime.next().toString()
  }
    
  return(
    <div>
      <h1>Rules</h1>
      {motors?.length === 0 ? (
        <Card backgroundColor='#2d333b' marginBottom='15px'>
          <CardHeader title="No motors defined" />
          <Txt>
            Rules are connected to motors. Create a motor first on the 'Motors' page then assign a rule to it here.
          </Txt>
        </Card>) 
      : 
        rules && rules.length ? 
        <Accordion items={rules?.map(v => (
        {
          label: v.name || v.sensor,
          panel: <Box>
              { v.sensor === 'cron' ?
                <Txt>
                    Move <b>{motors?.find(m => m.id === v.targetMotorId)?.name}</b> to <b>{v.targetPercent}</b>%<br />
                    when time matches <br />
                    <b>{v.treshold}</b> <br />
                    with priority <b>{v.priority}</b>. <br />
                    Next time: {parseCron(v.treshold)}
                </Txt> 
                : 
                <Txt>
                    Move <b>{motors?.find(m => m.id === v.targetMotorId)?.name}</b> to <b>{v.targetPercent}</b>%<br />
                    when <b>{v.sensor}</b><br />
                    goes <b>{v.above ? 'above' : 'below'} {v.treshold}</b>,<br />
                    with priority <b>{v.priority}</b>
                </Txt>
              }
              <Box style={{textAlign: 'right', paddingTop: '20px'}}>
                <Button danger onClick={() => deleteRule(v.id)} icon={<IconDelelete/>}>
                  Remove
                </Button>
              </Box>
            </Box>
        })) as any} 
        />
        :
        <Card backgroundColor='#2d333b' color='lightgrey' marginBottom='15px'>
          <CardHeader title="No rules yet"/>
          <Txt>
            Create them with the plus icon below
          </Txt>
        </Card>
      }
      <Button 
        primary 
        onClick={() => openAddRule()}
        className="add-fab"
        disabled={motors?.length === 0}
        padding='30px'
        style={{fontSize: '30px', borderRadius: '100%'}}
        width={60}
      >
        <IconPlus />
      </Button>

      { addDialog ? 
        <Modal 
          title="Add new rule"
          action='Submit'
          cancel={() => closeAddRule()} 
          done={() => submitAddRule()}
          style={{backgroundColor: '#2d333b', color: 'lightgray'}}
        >
          <React.Fragment key=".0">
            { newRule['name']?.length ? 'Name' : '\u00A0' }
            <Input
              placeholder='Name'
              value={newRule['name']}
              onChange={(e) => handleFormUpdate('name', e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
            />

            { newRule['sensor'] ? 'Sensor*' : '\u00A0' }
            <Select
              options={sensors}
              onChange={(e) => handleFormUpdate('sensor', (e.value as any))}
              value={newRule.sensor ? <Input value={newRule['sensor']} color='lightgray' readOnly emphasized style={{border: 'none'}} /> : undefined }
              emphasized
              marginBottom='8px'
              placeholder='Sensor*'
            />

            { newRule['targetPercent'] ? 'Target percent*' : '\u00A0' }
            <Input
              placeholder='Target percent*'
              value={newRule['targetPercent']}
              onChange={(e) => handleFormUpdate('targetPercent', +e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
              type='number'
            />  

            { newRule['targetMotorId'] ? 'Motor*' : '\u00A0' }
            <Select
              options={motors?.map((motor) => ({name: motor.name, value: motor.id}))}
              onChange={(e) => handleFormUpdate('targetMotorId', +(e.value as any).value)}
              value={newRule['targetMotorId']?.toString()}
              valueLabel={newRule.targetMotorId ? <Input value={motors.find(m => m.id === newRule.targetMotorId)?.name} readOnly emphasized color='lightgray' style={{border: 'none'}}/> : undefined }
              valueKey='value'
              labelKey='name'
              emphasized
              marginBottom='8px'
              placeholder='Motor'
            />      

            { newRule['treshold'] ? (newRule.sensor === 'cron' ? 'Cron pattern*' : 'Treshold*') : '\u00A0' }
            <Input
              placeholder={(newRule.sensor === 'cron' ? 'Cron pattern*' : 'Treshold*')}
              value={newRule['treshold']}
              onChange={(e) => handleFormUpdate('treshold', e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
              type={(newRule.sensor === 'cron' ? 'text' : 'number')}
            />   

            { newRule.sensor !== 'cron' ? 
              <Checkbox
                label="Above?"
                onChange={(e) => handleFormUpdate('above', e.currentTarget.checked)}
                checked={newRule.above}
              />
            : '' }

            { newRule['priority'] ? 'Priority' : '\u00A0' }
            <Input
              placeholder='Priority'
              value={newRule['priority']}
              onChange={(e) => handleFormUpdate('priority', +e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
              type='number'
            />

          </React.Fragment>
        </Modal>
      : '' }
      
      { showSnackBar ?
        <Alert
          bg='#2d333b'
          onDismiss={handleCloseSnackbar}
          success={snackBarMessage === 'Added'}
          danger={snackBarMessage !== 'Added'}
          style={{position: 'absolute', bottom: '70px', zIndex: 99}}
          solid
        >
          <Txt color='lightgray'>
            {snackBarMessage}
          </Txt>
        </Alert>
      : '' }
    </div>    
  );
}

export default Rules