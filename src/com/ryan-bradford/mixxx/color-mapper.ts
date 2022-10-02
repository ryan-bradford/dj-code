export interface ColorMapperType {

    new (colors: { [key: number]: number}) : ColorMapperType;

    getValueForNearestColor(colorCode: number): number;

    getNearestColor(colorCode: number): {
        red: number,
        blue: number,
        green: number
    }

}
