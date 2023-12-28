import { useState } from "react";
import { toast } from "react-toastify";
import { request } from "@/config/axios";
import useUserStore from "@/hooks/useUserStore";


export const useUser = () => {
  const setUsersList= useUserStore(state=>state.setUsersList)
  const [loading, setLoading] = useState(false);

const getUsers = async () => {
    try {
      setLoading(true);
      const { data } = await request.get("/users/all");
      setLoading(false);  
      console.log("users",data)  
      if (data.users) {   
        setUsersList(data.users)
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error(err?.response?.data?.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  
  return { getUsers, loading };
};


