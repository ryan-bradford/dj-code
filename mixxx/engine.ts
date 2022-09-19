export interface Engine {
    setValue(channel: String, name: String, value: number): void;
    getValue(channel: String, name: String): number;
}