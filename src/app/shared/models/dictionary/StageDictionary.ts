export class StageDictionary {
    static readonly VALUES: StageDef[] = [
        StageDictionary.createStageDef(3, 'Aphelian Sanctuary'),
        StageDictionary.createStageDef(4, 'Void Fields'),
        StageDictionary.createStageDef(5, 'Hidden Realm: Bulwark\'s Ambry'),
        StageDictionary.createStageDef(6, 'Hidden Realm: Gilded Coast'),
        StageDictionary.createStageDef(7, 'Distant Roost'),
        StageDictionary.createStageDef(8, 'Distant Roost'),
        StageDictionary.createStageDef(10, 'Abyssal Depths'),
        StageDictionary.createStageDef(12, 'Wetland Aspect'),
        StageDictionary.createStageDef(13, 'Rallypoint Delta'),
        StageDictionary.createStageDef(14, 'Hidden Realm: Gilded Coast'),
        StageDictionary.createStageDef(15, 'Titanic Plains'),
        StageDictionary.createStageDef(16, 'Titanic Plains'),
        StageDictionary.createStageDef(17, 'Abandoned Aqueduct'),
        StageDictionary.createStageDef(20, 'The Simulacrum'),
        StageDictionary.createStageDef(21, 'The Simulacrum'),
        StageDictionary.createStageDef(22, 'The Simulacrum'),
        StageDictionary.createStageDef(23, 'The Simulacrum'),
        StageDictionary.createStageDef(24, 'The Simulacrum'),
        StageDictionary.createStageDef(25, 'The Simulacrum'),
        StageDictionary.createStageDef(26, 'The Simulacrum'),
        StageDictionary.createStageDef(27, 'Hidden Realm: A Moment, Whole'),
        StageDictionary.createStageDef(32, 'Commencement'),
        StageDictionary.createStageDef(33, 'Hidden Realm: A Moment, Fractured'),
        StageDictionary.createStageDef(35, 'Sundered Grove'),
        StageDictionary.createStageDef(37, 'Siren\'s Call'),
        StageDictionary.createStageDef(38, 'Sky Meadow'),
        StageDictionary.createStageDef(39, 'Siphoned Forest'),
        StageDictionary.createStageDef(41, 'Sulfur Pools'),
        StageDictionary.createStageDef(45, 'Void Locus'),
        StageDictionary.createStageDef(46, 'The Planetarium'),
        StageDictionary.createStageDef(47, 'Scorched Acres'),
    ]

    private static createStageDef(index: number, name: string): StageDef {
        return { index, name };
    }

    public static getStageDef(index: number): StageDef {
        return this.VALUES.find((value: StageDef) => value.index === index) ?? { name: 'UNKNOWN', index: -1 };
    }
}

export interface StageDef {
    index: number;
    name: string;
}
