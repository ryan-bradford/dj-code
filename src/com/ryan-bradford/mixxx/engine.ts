export interface Engine {
    makeConnection(arg0: string, arg1: string, callback: (arg: any) => void): Connection;
    setValue(channel: String, name: String, value: number): void;
    setValue(channel: String, name: String, value: boolean): void;
    getValue(channel: String, name: String): number;
    log(text: string): void;
    log(number: number): void;
    log(boolean: boolean): void;
}

export interface Connection {
    disconnect(): void;
    trigger(): void;
}