import React from 'react'
import { formatDistanceToNow } from 'date-fns';


//Date renderer component

interface DateRendererPops {
  mode: string;
  date_string: string;
}

const DateRenderer = ({mode,date_string}: DateRendererPops) => {
    console.log('DATE STRING',date_string);
    
    const renderDate = () => {
      try {
        if (mode === 'ago'){
          const date = new Date(date_string);
      return formatDistanceToNow(date, { addSuffix: true });
      
      }
        const date = new Date(date_string)
      const readableDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        console.log(readableDate);
        
        return readableDate
      
      

      } catch (error) {
        console.log(error);
        return null
        
      }
        
        
    }
  return renderDate()
    
  
}

export default DateRenderer
