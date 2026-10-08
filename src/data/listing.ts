/**
 * Fragmentos reales de Luminary 099, el software del módulo lunar del Apollo 11,
 * tal y como están en https://github.com/chrislgarry/Apollo-11.
 * Cada línea conserva su número en el fichero original.
 */

import type { Lang } from '../i18n';

const REPO = 'https://github.com/chrislgarry/Apollo-11/blob/master/Luminary099';

/** Columnas del listado: etiqueta, instrucción, operando y comentario */
const row = (label: string, op: string, operand = '', comment = '') =>
	(label.padEnd(12) + op.padEnd(8) + operand.padEnd(16) + comment).trimEnd();

export interface Line {
	n: number;
	text: string;
	note?: string;
}

export interface Excerpt {
	file: string;
	lines: (Line | 'gap')[];
	notes: { id: string; text: Record<Lang, string>; from: number; to: number }[];
}

export const excerpts: Excerpt[] = [
	{
		file: 'THE_LUNAR_LANDING.agc',
		lines: [
			{ n: 239, text: row('P63SPOT3', 'CA', 'BIT6', '# IS THE LR ANTENNA IN POSITION 1 YET') },
			{ n: 240, text: row('', 'EXTEND') },
			{ n: 241, text: row('', 'RAND', 'CHAN33') },
			{ n: 242, text: row('', 'EXTEND') },
			{ n: 243, text: row('', 'BZF', 'P63SPOT4', '# BRANCH IF ANTENNA ALREADY IN POSITION 1') },
			{ n: 244, text: '' },
			{ n: 245, text: row('', 'CAF', 'CODE500', '# ASTRONAUT:    PLEASE CRANK THE'), note: 'crank' },
			{ n: 246, text: row('', 'TC', 'BANKCALL', '#               SILLY THING AROUND'), note: 'crank' },
			{ n: 247, text: row('', 'CADR', 'GOPERF1') },
			{ n: 248, text: row('', 'TCF', 'GOTOPOOH', '# TERMINATE') },
			{ n: 249, text: row('', 'TCF', 'P63SPOT3', "# PROCEED       SEE IF HE'S LYING"), note: 'lying' },
			{ n: 250, text: '' },
			{ n: 251, text: row('P63SPOT4', 'TC', 'BANKCALL', '# ENTER         INITIALIZE LANDING RADAR') },
			{ n: 252, text: row('', 'CADR', 'SETPOS1') },
			{ n: 253, text: '' },
			{ n: 254, text: row('', 'TC', 'POSTJUMP', '# OFF TO SEE THE WIZARD...'), note: 'wizard' },
			{ n: 255, text: row('', 'CADR', 'BURNBABY'), note: 'wizard' },
		],
		notes: [
			{
				id: 'crank',
				from: 245,
				to: 246,
				text: { es: 'Si la antena del radar de aterrizaje no está en su sitio, el ordenador le pide al astronauta que gire «el chisme ese».', en: 'If the landing radar antenna isn’t in position, the computer asks the astronaut to “crank the silly thing around”.' },
			},
			{ id: 'lying', from: 249, to: 249, text: { es: 'Luego vuelve a comprobarlo. Por si le ha mentido.', en: 'Then it checks again. In case he’s lying.' } },
			{
				id: 'wizard',
				from: 254,
				to: 255,
				text: { es: 'Si todo está bien, «se va a ver al mago»: salta a la rutina que enciende el motor.', en: 'If all is well, it’s “off to see the wizard”: it jumps to the routine that fires the engine.' },
			},
		],
	},
	{
		file: 'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
		lines: [
			{ n: 45, text: '# BURN, BABY, BURN -- MASTER IGNITION ROUTINE', note: 'burn' },
			{ n: 46, text: '' },
			{ n: 47, text: row('', 'BANK', '36') },
			{ n: 48, text: row('', 'SETLOC', 'P40S') },
			{ n: 49, text: row('', 'BANK') },
			{ n: 50, text: row('', 'EBANK=', 'WHICH') },
			{ n: 51, text: row('', 'COUNT*', '$$/P40') },
			'gap',
			{
				n: 64,
				text: '# THE MASTER IGNITION ROUTINE WAS CONCEIVED AND EXECUTED, AND (NOTA BENE) IS MAINTAINED BY ADLER AND EYLES.',
				note: 'honi',
			},
			{ n: 65, text: '#' },
			{ n: 66, text: '#               HONI SOIT QUI MAL Y PENSE', note: 'honi' },
		],
		notes: [
			{
				id: 'burn',
				from: 45,
				to: 45,
				text: { es: 'Esa rutina se llama «Burn, baby, burn», como el grito con el que un DJ de los 60 pinchaba sus discos.', en: 'That routine is called “Burn, baby, burn”, after the catchphrase a 1960s DJ shouted while spinning records.' },
			},
			{
				id: 'honi',
				from: 64,
				to: 66,
				text: { es: 'La firman sus autores, Adler y Eyles. Con un lema en francés: «que se avergüence quien piense mal».', en: 'Signed by its authors, Adler and Eyles. With a motto in French: “shame on anyone who thinks evil of it”.' },
			},
		],
	},
	{
		file: 'LUNAR_LANDING_GUIDANCE_EQUATIONS.agc',
		lines: [
			{ n: 174, text: row('VRTSTART', 'TS', 'WCHVERT') },
			{ n: 176, text: row('', 'CAF', 'TWO', '# WCHPHASE = 2 ---> VERTICAL: P65,P66,P67') },
			{ n: 177, text: row('', 'TS', 'WCHPHOLD') },
			{ n: 178, text: row('', 'TS', 'WCHPHASE') },
			{ n: 179, text: row('', 'TC', 'BANKCALL', '# TEMPORARY, I HOPE HOPE HOPE'), note: 'hope' },
			{ n: 180, text: row('', 'CADR', 'STOPRATE', '# TEMPORARY, I HOPE HOPE HOPE'), note: 'hope' },
			{ n: 181, text: row('', 'TC', 'DOWNFLAG', '# PERMIT X-AXIS OVERRIDE') },
		],
		notes: [
			{ id: 'hope', from: 179, to: 180, text: { es: '«Temporal, espero, espero, espero». Este apaño aterrizó en la Luna.', en: '“Temporary, I hope hope hope.” This quick fix landed on the Moon.' } },
		],
	},
	{
		file: 'PINBALL_GAME_BUTTONS_AND_LIGHTS.agc',
		lines: [
			{ n: 216, text: '# THE FOLLOWING QUOTATION IS PROVIDED THROUGH THE COURTESY OF THE AUTHORS.' },
			{ n: 217, text: '#' },
			{ n: 218, text: '#       ::IT WILL BE PROVED TO THY FACE THAT THOU HAST MEN ABOUT THEE THAT', note: 'pinball' },
			{ n: 219, text: '# USUALLY TALK OF A NOUN AND A VERB, AND SUCH ABOMINABLE WORDS AS NO', note: 'pinball' },
			{ n: 221, text: '# CHRISTIAN EAR CAN ENDURE TO HEAR.::', note: 'pinball' },
			{ n: 222, text: '#                                       HENRY 6, ACT 2, SCENE 4' },
		],
		notes: [
			{
				id: 'pinball',
				from: 218,
				to: 221,
				text: { es: 'El programa del teclado, el de los VERB y NOUN del DSKY, se llama «juego de pinball». Y empieza citando a Shakespeare.', en: 'The keyboard program, the one behind the DSKY’s VERB and NOUN, is called “pinball game”. And it opens by quoting Shakespeare.' },
			},
		],
	},
	{
		file: 'BURN_BABY_BURN--MASTER_IGNITION_ROUTINE.agc',
		lines: [
			{ n: 904, text: row('P40AUTO', 'TC', 'MAKECADR', '# HELLO THERE.'), note: 'bye' },
			{ n: 905, text: row('', 'TS', 'TEMPR60', '# FOR GENERALIZED RETURN TO OTHER BANKS.') },
			{ n: 906, text: row('P40A/P', 'TC', 'BANKCALL', '# SUBROUTINE TO CHECK PGNCS CONTROL') },
			'gap',
			{ n: 924, text: row('GOBACK', 'CA', 'TEMPR60') },
			{ n: 925, text: row('', 'TC', 'BANKJUMP', '# GOODBYE.  COME AGAIN SOON.'), note: 'bye' },
		],
		notes: [{ id: 'bye', from: 904, to: 925, text: { es: 'Educado hasta el final: «hola» al entrar, «adiós, vuelve pronto» al salir.', en: 'Polite to the end: “hello” on the way in, “goodbye, come again soon” on the way out.' } }],
	},
];

export const lineHref = (file: string, from: number, to: number) =>
	`${REPO}/${file}#L${from}${to !== from ? `-L${to}` : ''}`;
