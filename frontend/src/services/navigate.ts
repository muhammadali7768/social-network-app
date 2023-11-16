class Navigate {
    private _navigate: any;
  
    initNavigate = (instance: any) => {
      this._navigate = instance;
    };
  
    get navigate() {
      return this._navigate;
    }
  }
  const navigate=new Navigate();
  export default navigate;