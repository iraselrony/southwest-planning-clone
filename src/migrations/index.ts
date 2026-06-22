import * as migration_20260621_142842 from "./20260621_142842";
import * as migration_20260622_021323 from "./20260622_021323";
import * as migration_20260622_040014 from "./20260622_040014";

export const migrations = [
	{
		up: migration_20260621_142842.up,
		down: migration_20260621_142842.down,
		name: "20260621_142842",
	},
	{
		up: migration_20260622_021323.up,
		down: migration_20260622_021323.down,
		name: "20260622_021323",
	},
	{
		up: migration_20260622_040014.up,
		down: migration_20260622_040014.down,
		name: "20260622_040014",
	},
];
