import React, { useState, useEffect } from 'react';
import { NewMotorModel, MotorModel } from '../models';
import { ApiError, createMotor, deletelMotorById, getAllMotors } from '../services/Api';

import { 
  CardHeader
} from '@material-ui/core';
import { 
  Add as IconPlus,
  DeleteForever as IconDelelete,
} from '@material-ui/icons'
import { 
  Accordion,
  Alert,
  Box,
  Button,
  Card,
  Input,
  Select,
  Modal,
  Txt
} from 'rendition'

function Motors() {
  let [motors, setMotors] = useState<MotorModel[]>([])
  let [addDialog, setAddDialog] = useState(false)
  let [showSnackBar, setShowSnackBar] = useState(false)
  let [snackBarMessage, setSnackBarMessage] = useState("")
  let [newMotor, setNewMotor] = useState<NewMotorModel>({} as NewMotorModel)

  const fetchMotors = async () => { 
    const motors = await getAllMotors()
    setMotors(motors)
  }

  useEffect(() => {
    fetchMotors();
  }, [])

  useEffect(() => {
    if (showSnackBar) {
      setTimeout(() => {
        handleCloseSnackbar();
      }, 6000);  
    }
  }, [showSnackBar]);

  let openAddMotor = () => {
    setAddDialog(true)
  }

  let closeAddMotor = () => {
    setAddDialog(false)
  }

  let handleFormUpdate = (propName: keyof NewMotorModel, value: string | boolean | number) => {
    let updated: any = { ...newMotor } 
    updated[propName] = value
    setNewMotor({ ...updated })
  }

  let submitAddMotor = async () => {
    const createResponse = await createMotor(newMotor);
    if ((createResponse as ApiError).error) {
      closeAddMotor();
      handleShowSnackBar((createResponse as ApiError).error)
    } else {
      closeAddMotor();
      handleShowSnackBar("Added");
      fetchMotors()
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

  let deleteMotor = async (id: number) => {
    await deletelMotorById(id);
    // refresh the ui
    await fetchMotors()
  }
    
  return(
    <div>
      <h1>Motors</h1>
      {motors?.length ?         
        <Accordion items={motors && motors.map(v => (
          {
            label: v.name,
            panel: <Box>
                Motor NO. <b>{v.motorNo}</b><br />
                on layer <b>{v.layerNo}</b><br />
                moves <b>{v.stepLength}</b> unit(s) with one step<br />
                On a curtain <b>{v.fullDistance}</b> units wide.
                <Box style={{textAlign: 'right', paddingTop: '20px'}}>
                  <Button danger onClick={() => deleteMotor(v.id)} icon={<IconDelelete/>}>
                    Remove
                  </Button>
                </Box>
              </Box>
          })) as any} 
        />
      :
        <Card backgroundColor='#2d333b' marginBottom='15px'>
          <CardHeader title="Add your first motor by clicking the plus below." />
          <Txt>
            Then add more the same way.
          </Txt>
        </Card>
      }
      <Button 
        primary 
        onClick={() => openAddMotor()}
        className="add-fab"
        padding='30px'
        style={{fontSize: '30px', borderRadius: '100%'}}
        width={60}
      >
        <IconPlus />
      </Button>

      { addDialog ? 
        <Modal 
          title="Add new motor"
          action='Submit'
          cancel={() => closeAddMotor()} 
          done={() => submitAddMotor()}
          style={{backgroundColor: '#2d333b', color: 'lightgray'}}
        >
          <React.Fragment key=".0">
            { newMotor['name']?.length ? 'Name*' : '\u00A0' }
            <Input
              placeholder='Name*'
              value={newMotor['name']}
              onChange={(e) => handleFormUpdate('name', e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
            />
           
           { newMotor['stepLength'] ? 'Step length*' : '\u00A0' }
            <Input
              placeholder='Step length*'
              value={newMotor['stepLength']}
              onChange={(e) => handleFormUpdate('stepLength', e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
              type="number"
            />     

            { newMotor['fullDistance'] ? 'Full distance*' : '\u00A0' }
            <Input
              placeholder='Full distance*'
              value={newMotor['fullDistance']}
              onChange={(e) => handleFormUpdate('fullDistance', +e.currentTarget.value)}            
              emphasized
              color='lightgray'
              marginBottom='8px'
              type='number'
            />       
            
            { newMotor['layerNo'] ? 'Layer NO.' : '\u00A0' }
            <Select
              options={['1','2','3','4']}
              onChange={(e) => handleFormUpdate('layerNo', +(e.value as any))}
              value={newMotor['layerNo']?.toString()}
              emphasized
              marginBottom='8px'
              placeholder='Layer NO.'
            />

            { newMotor['motorNo'] ? 'Motor NO.' : '\u00A0' }
            <Select
              options={['1','2']}
              onChange={(e) => handleFormUpdate('motorNo', +(e.value as any))}
              value={newMotor['motorNo']?.toString()}
              emphasized
              marginBottom='8px'
              placeholder='Motor NO.'
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

export default Motors