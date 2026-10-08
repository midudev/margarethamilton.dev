/**
 * WAITLIST.agc, from Luminary 099: the lunar module's task scheduler.
 * First its specification (revisions, warnings, how it's called, how it exits and what it clobbers)
 * and then the code that fulfills it, down to the “NO ROOM IN THE INN” that raises alarm 1203.
 * The text is the original file's; only the tabs have been normalized.
 */

import { lineHref } from './listing';

export const file = 'WAITLIST.agc';
export const href = lineHref(file, 32, 32);

export interface Token {
	/** head: section title · doc: comment · label, op, arg, note: code columns */
	k: 'head' | 'doc' | 'label' | 'op' | 'arg' | 'note';
	s: string;
}

export type Row = { n: number; tokens: Token[] } | 'gap';

const doc = (s: string): Token[] => [{ k: 'doc', s }];
const head = (s: string, rest = ''): Token[] => (rest ? [{ k: 'head', s }, { k: 'doc', s: rest }] : [{ k: 'head', s }]);

/** Listing columns: label, instruction, operand and comment, with no trailing spaces */
const code = (label: string, op: string, operand = '', comment = ''): Token[] => {
	const cols: Token[] = [
		{ k: 'label', s: label.padEnd(10) },
		{ k: 'op', s: op.padEnd(8) },
		{ k: 'arg', s: operand.padEnd(11) },
		{ k: 'note', s: comment },
	];
	while (cols.length && !cols[cols.length - 1].s.trim()) cols.pop();
	const last = cols[cols.length - 1];
	if (last) last.s = last.s.trimEnd();
	return cols;
};

const row = (n: number, tokens: Token[]): Row => ({ n, tokens });

export const rows: Row[] = [
	row(32, head('# PROGRAM DESCRIPTION'.padEnd(52), 'DATE -- 10 OCTOBER 1966')),
	row(33, doc('# MOD NO -- 2'.padEnd(52) + 'LOG SECTION -- WAITLIST')),
	row(34, doc('# MOD BY -- MILLER  (DTMAX INCREASED TO 162.5 SEC)'.padEnd(52) + 'ASSEMBLY -- SUNBURST REV 5')),
	row(35, doc('# MOD 3 BY KERNAN   (INHINT INSERTED AT WAITLIST) 2/28/68 SKIPPER REV 4')),
	row(36, doc('# MOD 4 BY KERNAN   (TWIDDLE IN 54) 3/28/68 SKIPPER REV 13.')),
	row(37, doc('#')),
	'gap',
	row(58, head('# WARNINGS --')),
	row(59, doc('#   1)  1 <= C(A) <= 16250D (1 CENTISECOND TO 162.5 SEC)')),
	row(60, doc('#   2)  9 TASKS MAXIMUM')),
	row(61, doc('#   3)  TASKS CALLED UNDER INTERRUPT INHIBITED')),
	row(62, doc('#   4)  TASKS END BY TC TASKOVER')),
	row(63, doc('#')),
	row(64, head('# CALLING SEQUENCE --')),
	row(65, doc('#   L-1   CA      DELTAT    (TIME IN CENTISECONDS TO TASK START)')),
	row(66, doc('#   L     TC      WAITLIST')),
	row(67, doc('#   L+1   2CADR   DESIRED TASK.')),
	row(68, doc('#   L+2   (MINOR OF 2CADR)')),
	row(69, doc('#   L+3   RELINT            (RETURNS HERE)')),
	row(70, doc('#')),
	'gap',
	row(81, head('# NORMAL EXIT MODES --')),
	row(82, doc('#   AT L+3 OF CALLING SEQUENCE.')),
	row(83, doc('#')),
	row(84, head('# ALARM OR ABORT EXIT MODES --')),
	row(85, doc('#   TC      ABORT')),
	row(86, doc('#   OCT     1203    (WAITLIST OVERFLOW -- TOO MANY TASKS)')),
	row(87, doc('#')),
	row(88, head('# ERASABLE INITIALIZATION REQUIRED --')),
	row(89, doc('#   ACCOMPLISHED BY FRESH START --  LST2, ..., LST2 +16 = ENDTASK')),
	row(90, doc('#                                   LST1, ..., LST1 +7  = NEG1/2')),
	row(91, doc('#')),
	row(92, head('# OUTPUT --')),
	row(93, doc('#   LST1 AND LST2 UPDATED WTIH NEW TASK AND ASSOCIATED TIME.')),
	row(94, doc('#')),
	row(95, head('# DEBRIS --')),
	row(96, doc('#   CENTRALS -- A,Q,L')),
	row(97, doc('#   OTHER    -- WAITEXIT, WAITADR, WAITTEMP, WAITBANK')),
	'gap',
	row(129, code('WAITLIST', 'INHINT')),
	row(130, code('', 'XCH', 'Q', '# SAVE DELTA T IN Q AND RETURN IN')),
	row(131, code('', 'TS', 'WAITEXIT', '# WAITEXIT.')),
	row(132, code('', 'EXTEND')),
	row(133, code('', 'INDEX', 'WAITEXIT', '# IF TWIDDLING, THE TS SKIPS TO HERE')),
	row(134, code('', 'DCA', '0', '# PICK UP 2CADR OF TASK.')),
	row(135, code(' -1', 'TS', 'WAITADR', '# BBCON WILL REMAIN IN L')),
	row(136, code('DLY2', 'CAF', 'WAITBB', '# ENTRY FROM FIXDELAY AND VARDELAY.')),
	row(137, code('', 'XCH', 'BBANK')),
	row(138, code('', 'TCF', 'WAIT2')),
	row(139, []),
	row(140, doc('# RETURN TO CALLER AFTER TASK INSERTION:')),
	row(141, []),
	row(142, code('LVWTLIST', 'DXCH', 'WAITEXIT')),
	row(143, code('', 'AD', 'TWO')),
	row(144, code('', 'DTCB')),
	'gap',
	row(266, code('', 'DXCH', 'LST2 +16D')),
	row(267, code('', 'AD', 'ENDTASK', '# END ITEM, AS CHECK FOR EXCEEDING')),
	row(268, code('', '', '', '# THE LENGTH OF THE LIST.')),
	row(269, code('', 'EXTEND', '', '# DUMMY TASK ADRES SHOULD BE IN FIXED-')),
	row(270, code('', 'BZF', 'LVWTLIST', '# FIXED SO ITS ADRES ALONE DISTINGUISHES')),
	row(271, code('', 'TCF', 'WTABORT', '# IT.')),
	'gap',
	row(334, code('FILLED', 'DXCH', 'WAITEXIT')),
	row(335, code('', 'TC', 'BAILOUT1', '# NO ROOM IN THE INN')),
	row(336, code('', 'OCT', '01203')),
];
