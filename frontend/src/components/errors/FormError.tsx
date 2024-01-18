import { IError } from "@/interfaces/error.interface";
interface IProps{
  errors: IError[]
  
}
export const FormError = ({errors}:IProps) => {
  return (
    <ul
      className="list-disc p-4 px-6 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
        {
            errors.length >0 && errors.map(err=>{
            return <li className="font-medium" key={err.message}>{err.message}</li> 
            })
        }
      
    </ul>
  );
};
