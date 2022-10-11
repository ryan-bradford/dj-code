export interface Engine {
    setParameter(variable: string, arg1: string, arg2: number): void;
    makeConnection(arg0: string, arg1: string, callback: (arg: any) => void): Connection;
    setValue(channel: String, name: String, value: number): void;
    setValue(channel: String, name: String, value: boolean): void;
    getValue(channel: String, name: String): number;
    log(text: string): void;
    log(number: number): void;
    log(boolean: boolean): void;
    beginTimer(timeout: number, callback: () => void);
    beginTimer(timeout: number, callback: () => void, executions: number);
}

export interface Connection {
    disconnect(): void;
    trigger(): void;
}