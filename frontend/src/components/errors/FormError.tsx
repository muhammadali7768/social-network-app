interface IError {
    message:string,
    field?: string
}
export const FormError = (errors: IError[]) => {
  return (
    <ul
      className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
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
