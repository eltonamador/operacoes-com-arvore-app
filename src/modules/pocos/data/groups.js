/**
 * Distribuição oficial de grupos por pelotão — Prova Espaço Confinado (Poço)
 * Fonte: distribuicao_grupos_por_pelotao_poco.pdf
 *
 * Estrutura: { [pelotao]: [ { num, integrantes: [{ id, nome }] } ] }
 * - pelotao: mesmo formato usado em students.json ("1º PEL" … "5º PEL")
 * - id: número de ordem do aluno (chave principal)
 * - nome: nome de exibição conforme distribuição oficial
 *
 * O PIN de cada integrante é resolvido em runtime via students.json (id === numero).
 * Integrantes adicionados manualmente recebem extra:true e pin explícito.
 */

export const GRUPOS_POR_PELOTAO = {
  '1º PEL': [
    {
      num: 1,
      integrantes: [
        { id: 16, nome: 'EVERTON LUIZ' },
        { id: 18, nome: 'CYNTIA' },
        { id: 19, nome: 'THAIS' },
        { id: 20, nome: 'EDUARDO' },
        { id: 32, nome: 'NALBERTH' },
        { id: 36, nome: 'WILLIAM' },
      ],
    },
    {
      num: 2,
      integrantes: [
        { id: 8,  nome: 'CHARLYS' },
        { id: 25, nome: 'ROBERTA' },
        { id: 26, nome: 'VITORIA' },
        { id: 28, nome: 'AFONSO' },
        { id: 33, nome: 'DAVI MATHEUS' },
        { id: 37, nome: 'NELSON' },
      ],
    },
    {
      num: 3,
      integrantes: [
        { id: 4,  nome: 'RAYANE OLIVEIRA' },
        { id: 13, nome: 'NAONNY' },
        { id: 17, nome: 'ANDRÉ FILIPE' },
        { id: 23, nome: 'MARIA' },
        { id: 27, nome: 'FLÁVIO' },
        { id: 35, nome: 'MESQUITA' },
      ],
    },
    {
      num: 4,
      integrantes: [
        { id: 1,  nome: 'CRUZ' },
        { id: 6,  nome: 'ELIVÉLTON' },
        { id: 21, nome: 'TAIANA' },
        { id: 22, nome: 'GABRIELLE' },
        { id: 29, nome: 'BENATHAR' },
      ],
    },
    {
      num: 5,
      integrantes: [
        { id: 2,  nome: 'TIAGO FERREIRA' },
        { id: 7,  nome: 'PRAXEDES' },
        { id: 11, nome: 'KAWAN' },
        { id: 12, nome: 'LARISSA' },
        { id: 24, nome: 'LUAN CASTRO' },
      ],
    },
    {
      num: 6,
      integrantes: [
        { id: 9,  nome: 'JAMESON' },
        { id: 10, nome: 'TATYELY' },
        { id: 15, nome: 'NAKALYSSON' },
        { id: 30, nome: 'LUIZ OTAVIO' },
        { id: 34, nome: 'CHAVES' },
      ],
    },
  ],

  '2º PEL': [
    {
      num: 1,
      integrantes: [
        { id: 39, nome: 'RONAM' },
        { id: 40, nome: 'CHARLOTH' },
        { id: 45, nome: 'WYLLEN' },
        { id: 50, nome: 'ABREU' },
        { id: 56, nome: 'LUANA' },
        { id: 66, nome: 'SARGES' },
      ],
    },
    {
      num: 2,
      integrantes: [
        { id: 44, nome: 'LUZIA' },
        { id: 47, nome: 'BIANCA' },
        { id: 52, nome: 'SAMUEL NEVES' },
        { id: 54, nome: 'PABLO' },
        { id: 62, nome: 'DIEGO' },
        { id: 64, nome: 'RYAN' },
      ],
    },
    {
      num: 3,
      integrantes: [
        { id: 41, nome: 'KALEBE' },
        { id: 43, nome: 'M CAMPOS' },
        { id: 46, nome: 'AMANDA ALVES' },
        { id: 57, nome: 'JULIANA' },
        { id: 58, nome: 'RAIGO' },
        { id: 71, nome: 'G VIEIRA' },
      ],
    },
    {
      num: 4,
      integrantes: [
        { id: 42, nome: 'KARINA SILVA' },
        { id: 48, nome: 'LUCAS ALEXANDRE' },
        { id: 51, nome: 'ANNA FLAVIA' },
        { id: 59, nome: 'ÂNDREO' },
        { id: 67, nome: 'CÉZAR' },
        { id: 69, nome: 'VITOR COLLARES' },
      ],
    },
    {
      num: 5,
      integrantes: [
        { id: 38, nome: 'ANAIRA' },
        { id: 53, nome: 'ALICE' },
        { id: 63, nome: 'ADAILSON' },
        { id: 68, nome: 'GABRIEL BARROS' },
        { id: 70, nome: 'NETO' },
      ],
    },
    {
      num: 6,
      integrantes: [
        { id: 49, nome: 'PALOMA' },
        { id: 55, nome: 'KAMILI SANTOS' },
        { id: 60, nome: 'RAMOM' },
        { id: 65, nome: 'AMORAS' },
        { id: 72, nome: 'THIAGO SILVA' },
      ],
    },
  ],

  '3º PEL': [
    {
      num: 1,
      integrantes: [
        { id: 82,  nome: 'RENATA' },
        { id: 87,  nome: 'EDUARDA' },
        { id: 89,  nome: 'EZEQUIEL' },
        { id: 94,  nome: 'PEDRO RODRIGUES' },
        { id: 101, nome: 'ALBERTO' },
        { id: 108, nome: 'HERICK' },
      ],
    },
    {
      num: 2,
      integrantes: [
        { id: 73,  nome: 'L MOREIRA' },
        { id: 91,  nome: 'RAFAEL MIRANDA' },
        { id: 93,  nome: 'CAMILA' },
        { id: 103, nome: 'ANDRADE' },
        { id: 106, nome: 'PALHETA' },
        { id: 109, nome: 'MORAIS' },
      ],
    },
    {
      num: 3,
      integrantes: [
        { id: 79,  nome: 'LIDIA' },
        { id: 84,  nome: 'V PORPINO' },
        { id: 86,  nome: 'FRANK' },
        { id: 96,  nome: 'BARBOSA' },
        { id: 100, nome: 'CHARLIE' },
        { id: 104, nome: 'NATANAEL' },
      ],
    },
    {
      num: 4,
      integrantes: [
        { id: 85,  nome: 'JENNY' },
        { id: 92,  nome: 'MAYRA' },
        { id: 95,  nome: 'CESAR AUGUSTO' },
        { id: 98,  nome: 'DANILO' },
        { id: 102, nome: 'MARCOS PAULO' },
        { id: 81,  nome: 'MANUELLY' },
      ],
    },
    {
      num: 5,
      integrantes: [
        { id: 74,  nome: 'HUGO' },
        { id: 75,  nome: 'EMANUELE BATISTA' },
        { id: 76,  nome: 'DJALMA' },
        { id: 80,  nome: 'GILMARIO' },
        { id: 83,  nome: 'BRELAZ' },
        { id: 90,  nome: 'MONALISA' },
      ],
    },
    {
      num: 6,
      integrantes: [
        { id: 77,  nome: 'LORENA' },
        { id: 78,  nome: 'HENRI' },
        { id: 88,  nome: 'J ARAÚJO' },
        { id: 97,  nome: 'ISMAEL' },
        { id: 99,  nome: 'M GARCIA' },
        { id: 105, nome: 'T OLIVEIRA' },
      ],
    },
  ],

  '4º PEL': [
    {
      num: 1,
      integrantes: [
        { id: 111, nome: 'BENTES' },
        { id: 112, nome: 'ALCIENE' },
        { id: 113, nome: 'LUIZ' },
        { id: 120, nome: 'JORDAN' },
        { id: 130, nome: 'WALZINTO' },
        { id: 131, nome: 'DEISIANE' },
      ],
    },
    {
      num: 2,
      integrantes: [
        { id: 110, nome: 'JESSICA' },
        { id: 119, nome: 'ALEIXO' },
        { id: 125, nome: 'SUZAN' },
        { id: 134, nome: 'RUENDERSON' },
        { id: 135, nome: 'L LACERDA' },
        { id: 138, nome: 'PANTOJA' },
      ],
    },
    {
      num: 3,
      integrantes: [
        { id: 117, nome: 'CÉSAR FELIPE' },
        { id: 123, nome: 'INGRID' },
        { id: 126, nome: 'SILVA' },
        { id: 127, nome: 'PAULA VLANNYSSA' },
        { id: 133, nome: 'LEANDRO' },
        { id: 136, nome: 'KERISON' },
      ],
    },
    {
      num: 4,
      integrantes: [
        { id: 114, nome: 'M FERNANDA' },
        { id: 115, nome: 'PAULO LOPES' },
        { id: 118, nome: 'A RODRIGUES' },
        { id: 139, nome: 'ALLAN' },
        { id: 140, nome: 'SÉRGIO' },
        { id: 143, nome: 'CAMILLO' },
      ],
    },
    {
      num: 5,
      integrantes: [
        { id: 116, nome: 'YANNA' },
        { id: 132, nome: 'ISABELLE AMARAL' },
        { id: 141, nome: 'J SOUZA' },
        { id: 142, nome: 'QUEIROZ' },
        { id: 144, nome: 'LUCAS COSTA' },
      ],
    },
    {
      num: 6,
      integrantes: [
        { id: 121, nome: 'BRENDHA' },
        { id: 122, nome: 'SAYMON' },
        { id: 128, nome: 'GOMES' },
        { id: 129, nome: 'B AMANAJAS' },
        { id: 137, nome: 'JHONNE' },
      ],
    },
  ],

  '5º PEL': [
    {
      num: 1,
      integrantes: [
        { id: 147, nome: 'JADNA' },
        { id: 150, nome: 'MAICON' },
        { id: 151, nome: 'ROSENELMA' },
        { id: 161, nome: 'HELLY' },
        { id: 177, nome: 'BRUNO' },
        { id: 180, nome: 'KARLO' },
      ],
    },
    {
      num: 2,
      integrantes: [
        { id: 148, nome: 'PORTILHO' },
        { id: 149, nome: 'LUNA' },
        { id: 155, nome: 'W MOREIRA' },
        { id: 156, nome: 'MAYARA' },
        { id: 160, nome: 'BELTRÃO' },
        { id: 171, nome: 'JEFERSON SILVA' },
      ],
    },
    {
      num: 3,
      integrantes: [
        { id: 146, nome: 'W LIMA' },
        { id: 152, nome: 'WEMERSON' },
        { id: 157, nome: 'JHEISON' },
        { id: 165, nome: 'ALINE NAYLA' },
        { id: 169, nome: 'NÚBIA' },
        { id: 172, nome: 'KAUÊ SOUZA' },
      ],
    },
    {
      num: 4,
      integrantes: [
        { id: 163, nome: 'JOÃO VITOR' },
        { id: 166, nome: 'ESTEVÃO' },
        { id: 167, nome: 'ROBERTO' },
        { id: 168, nome: 'MORETTY' },
        { id: 170, nome: 'VALÉRIA' },
        { id: 173, nome: 'F CHAGAS' },
      ],
    },
    {
      num: 5,
      integrantes: [
        { id: 154, nome: 'BRITO' },
        { id: 158, nome: 'BENTO' },
        { id: 164, nome: 'ROSÂNGELA' },
        { id: 176, nome: 'DAYANNE' },
        { id: 178, nome: 'FELIX' },
        { id: 179, nome: 'PASSOS' },
      ],
    },
    {
      num: 6,
      integrantes: [
        { id: 145, nome: 'LILIANE LIMA' },
        { id: 153, nome: 'THAÍLA' },
        { id: 159, nome: 'SIMPLICIO' },
        { id: 162, nome: 'CAMBRAIA' },
        { id: 174, nome: 'WESGLEY' },
      ],
    },
  ],
}

/** Retorna os grupos de um pelotão ou [] se não encontrado */
export function getGruposDoPelotao(pelotao) {
  return GRUPOS_POR_PELOTAO[pelotao] || []
}

/** Retorna os integrantes de um grupo específico de um pelotão */
export function getIntegrantesDoGrupo(pelotao, grupoNum) {
  const grupos = getGruposDoPelotao(pelotao)
  const grupo = grupos.find(g => g.num === grupoNum)
  return grupo ? grupo.integrantes : []
}
