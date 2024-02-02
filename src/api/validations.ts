import { Cmd, CmdType, GraphqlMirrorRequest, KillCmd, PauseCmd, RunCmd, RunCmdOptions } from './types.js';


// TypeScript cannot use arrowFunctions for assertions.

export function validateRunCmd (input: any): asserts input is RunCmd {
  if (typeof input !== 'object' || input === null) {
    throw new Error('command must be an object');
  }

  if(input.type !== CmdType.RUN){
      throw new Error('command must be of type RUN')
  }

  if(!input.identifier){
      throw new Error('identifier is required')
  }

  if(typeof input.identifier !== 'string'){
      throw new Error('identifier must be a string')
  }

  if(!input.options){
      throw new Error('options is required')
  }

  validateRunCmdOptions(input.options)
}

export function validatePauseCmd(input:any): asserts input is PauseCmd {

  if (typeof input !== 'object' || input === null) {
    throw new Error('command must be an object');
  }

  if(input.type !== CmdType.PAUSE){
      throw new Error('command must be of type PAUSE')
  }

  if(!input.identifier){
    throw new Error('identifier is required')
  }
}

export function validateKillCmd(input:any): asserts input is KillCmd {
    if (typeof input !== 'object' || input === null) {
      throw new Error('command must be an object');
    }

    if(input.type !== CmdType.KILL){
        throw new Error('command must be of type KILL')
    }

    if(!input.identifier){
      throw new Error('identifier is required')
    }

}

export function validateRunCmdOptions(input: any): asserts input is RunCmdOptions {
  if (typeof input !== 'object' || input === null) {
    throw new Error('options must be an object');
  }

  if(input.url && typeof input.url !== 'string'){
      throw new Error('url must be a string')
  }

  if(input.buffer && typeof input.buffer !== 'number'){
      throw new Error('buffer must be a number')
  }

  if(!input.perSec){
     throw new Error('perSec is required')
  }

  if(input.perSec === 0 || input.perSec > 1000){
      throw new Error('perSec must be between 1 and 1000')
  }

  if(input.buffer && (input.buffer < 1 || input.buffer > 1000)){
      throw new Error('buffer must be between 1 and 1000')
  }
}

export function validateCmd(input: any): asserts input is Cmd  {
  if (typeof input !== 'object' || input === null) {
    throw new Error('command must be non-empty object');
  }

  if(!input.type){
      throw new Error('type is required')
  }

  switch(input.type){
      case CmdType.RUN:
          validateRunCmd(input)
          break;
      case CmdType.PAUSE:
          validatePauseCmd(input)
          break;
      case CmdType.KILL:
          validateKillCmd(input)
          break;
      default:
          throw new Error('type must be a valid CmdType')
  }
}

export function validateGraphqlMirrorRequest(input: any): asserts input is GraphqlMirrorRequest {
  if (typeof input !== 'object' || input === null) {
    throw new Error('mirror request must be non-empty object');
  }

  if(!input.type){
      throw new Error('type is required')
  }

  if(input.type !== 'graphql'){
      throw new Error('type must be graphql')
  }


  if(!input.method){
    throw new Error('method is required')
  }

  if(input.method !== 'query' && input.method !== 'mutation'){
      throw new Error('method must be query or mutation')
  }
}
