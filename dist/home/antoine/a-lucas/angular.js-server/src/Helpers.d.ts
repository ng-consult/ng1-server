export default class Helpers {
    static Error(...args: any[]): void;
    static SameRegex(r1: RegExp, r2: RegExp): boolean;
    static CheckType(input: any, type: any | any[]): void;
    static StringIn(input: string, validValues: string[]): void;
    static RegexNotIn(regex: RegExp, regexes: RegExp[], desc?: string): void;
}
