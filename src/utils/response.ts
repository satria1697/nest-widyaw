import { HttpStatus } from '@nestjs/common';

type messageType = 'success' | 'fail';
export interface IResponse {
  data: Record<string, any> | any;
  code: HttpStatus;
  message: messageType;
}

export const response = (
  data?: Record<string, any> | any,
  message: messageType = 'success',
  code: HttpStatus = HttpStatus.OK,
): IResponse => ({
  data,
  code,
  message,
});
