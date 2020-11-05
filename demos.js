export const demos = {

'Addition':
`LDA 6
ADD 7
OUT
HLT
4
7`,

'Subtraction':
`LDA 6
SUB 7
OUT
HLT
57
17`,

'Multiplication':
`LDA 31
STA 34
LDA 32
STA 33
LDA 33
JIZ 27
LDA 34
ADD 31
STA 34
LDA 33
SEB 1
SBR
STA 33
JMP 8
LDA 34
OUT
HLT
5
10`,

'Counting':
`ADD 5
OUT
JMP 0
1`,

'Left Shift':
`ADD 9
AWC 10
STA 9
OUT
JMP 0
1
0`,

'Fibonacci 1':
`LDA 11
OUT
ADD 12
STA 12
STB 11
JMP 0
0
1`,

'Fibonacci 2':
`SEA 0
SEB 1
OUT
ADR
SWP
JMP 4`,

'Fill RAM':
`LDA 7
ADD 10
STA 7
STA 11
JMP 0
1`

}
