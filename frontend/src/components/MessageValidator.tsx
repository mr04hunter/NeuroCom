import React from 'react'

//message validator

export const MessageValidator = (message: string, setMessage:React.Dispatch<React.SetStateAction<string>>) => {
      if (message){
        const trimmedMessage = message.trim() //trim the spaces

        if (trimmedMessage === ''){
            setMessage('')
            return false
        }
        setMessage(trimmedMessage) //set the edited message
        return true;
      }
      return false

       
    }


