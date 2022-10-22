export class StageDictionary {
    static readonly VALUES: StageDef[] = [
        StageDictionary.createStage(3, 'Aphelian Sanctuary'),
        StageDictionary.createStage(4, 'Void Fields'),
        StageDictionary.createStage(7, 'Distant Roost'),
        StageDictionary.createStage(8, 'Distant Roost'),
        StageDictionary.createStage(10, 'Abyssal Depths'),
        StageDictionary.createStage(12, 'Wetland Aspect'),
        StageDictionary.createStage(13, 'Rallypoint Delta'),
        StageDictionary.createStage(15, 'Titanic Plains'),
        StageDictionary.createStage(16, 'Titanic Plains'),
        StageDictionary.createStage(17, 'Abandoned Aqueduct'),
        StageDictionary.createStage(20, 'The Simulacrum'),
        StageDictionary.createStage(21, 'The Simulacrum'),
        StageDictionary.createStage(22, 'The Simulacrum'),
        StageDictionary.createStage(23, 'The Simulacrum'),
        StageDictionary.createStage(24, 'The Simulacrum'),
        StageDictionary.createStage(25, 'The Simulacrum'),
        StageDictionary.createStage(26, 'The Simulacrum'),
        StageDictionary.createStage(32, 'Commencement'),
        StageDictionary.createStage(35, 'Sundered Grove'),
        StageDictionary.createStage(37, 'Siren\'s Call'),
        StageDictionary.createStage(38, 'Sky Meadow'),
        StageDictionary.createStage(39, 'Siphoned Forest'),
        StageDictionary.createStage(41, 'Sulfur Pools'),
        StageDictionary.createStage(45, 'Void Locus'),
        StageDictionary.createStage(46, 'The Planetarium'),
        StageDictionary.createStage(47, 'Scorched Acres'),
    ]

    private static createStage(index: number, name: string): StageDef {
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
