import { IpcClient, type IpcRequestConfig } from './IpcClient'
// import { type SweetAlertOptions } from 'sweetalert2';
// import { MySwal } from '../../utils/sweetalert';
import { toast } from '../../components/toast/toastManager';

//export type ConfirmFn = (options: SweetAlertOptions) => Promise<boolean>;

/*
const ConfirmModal = ({
  isOpen, 
  onCancel, 
  onConfirm, 
  title = "¿Estás seguro?", 
  message = " ¿Deseas continuar?", 
  confirmText = "Sí, continuar", 
  cancelText = "No, volver"
}: ConfirmModalProps) => {
*/

export type NotifyFn = {
  success(message: string): void;
  error(message: string): void;
};
export interface ApiResponse<T> {
  ok: boolean;
  data: T
}
interface ExecuteOptions<T> {
  request: IpcRequestConfig;
  hasMessage?:boolean;
  successMessage?: string|null|undefined;
  errorMessage?: string;
  success?: (data: T) => void;
  reject?: (error: unknown) => void;
}
//* SweetAler y toastify

// const defaultConfirm: ConfirmFn = async (options) => {
//   const result = await MySwal.fire({
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonText: 'Sí',
//     cancelButtonText: 'Cancelar',
//     ...options,
//   });
//   return result.isConfirmed;
// };

const defaultNotify: NotifyFn = {
  success: (msg) => toast.success(msg, 'Acción exitosa'),
  error: (msg) => toast.error(msg, 'Error'),
};

export class AdminApi {
    private ipc: IpcClient
    private notify: NotifyFn
  constructor(
    ipc: IpcClient,
    notify: NotifyFn = defaultNotify,
  ) {
    this.ipc= ipc;
    this.notify = notify;
  }

  async execute<T>({
    request,
    hasMessage,
    successMessage,
    errorMessage,
    //success,
    reject,
  }: ExecuteOptions<T>): Promise<T | void> {
    try {
   

      const response = await this.ipc.request<ApiResponse<T>>(request);
      if (hasMessage) {
        this.notify.success(successMessage ?? '');
      }
      return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendMessage = error?.message || error?.error?.message;
      this.notify.error(backendMessage ?? errorMessage ?? 'Error desconocido');
      console.error(error)
      reject?.(error);
    }
  }


}
