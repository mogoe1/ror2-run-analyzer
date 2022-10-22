
export abstract class LogEntry{
    public readonly time: number = 0;
    public readonly stopwatch: number = 0;

    protected _initializeWith(json:any){
        for(const propertyName of Object.getOwnPropertyNames(this)){
            if(json[propertyName] === undefined){
                console.warn(`Property "${propertyName}" not set during construction of`, this, json);
            }
           (this as any)[propertyName] = json[propertyName];
        }
    }
}