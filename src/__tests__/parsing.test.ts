
// test meant as a playground, not continuous integration

import { templates } from '../gpt/templates.js';
import { reflection } from '../parsing/reflection.js';

jest.setTimeout(100000)

describe('GPT playground tests', () => {
  it('generate json with default template', async() => {

    const json = await templates.generateJSON([{a: "Prague", b: "Želivského 805", c: "Letadlo"},{a: "Praha", b: "5th Avenue", c: "Ship"},] );

    // const test = await Promise.all(Array.from({length: 10}).map(async() => {
    //    return templates.generateJSON({a: "Prague", b: "Želivského 805", c: "Letadlo"}, );
    // }))

    expect(test).toBeDefined()

    expect(json).toBeDefined()
  });
  it('generate json www default template', async() => {

    const json = {
        "Notification": null,
        "Response": {
          "OutageHeads": {
            "OutageHead": [
              {
                "Id": "776024",
                "Ul": "NN",
                "Dsc": "Maxime expedita modi.",
                "Plc": "Occaecati velit magnam quia nulla sit ducimus non ut sunt quis eaque et quidem nihil modi porro eligendi voluptatem quaerat.",
                "Rsn": "Quaerat non quos ipsa quas.",
                "OutagePeriods": {
                  "OutagePeriod": [
                    {
                      "BgP": "2022-11-07T09:59:25.347Z",
                      "EdP": "2022-10-26T12:45:54.924Z",
                      "Pst": null,
                      "BgA": "2022-10-22T15:20:10.948Z",
                      "EdA": "2022-10-13T04:04:17.336Z",
                      "Crsn": null
                    }
                  ]
                },
                "Muns": {
                  "Mun": [
                    {
                      "BoxId": "ut nisi cillum minim",
                      "Ico": "00284301",
                      "Pods": {
                        "Pod": [
                          {
                            "P": "859182400101963687",
                            "I": "Duis eiusmod enim sunt et",
                            "G": 81717798,
                            "C": "Charleston",
                            "Cp": "Revere",
                            "S": "Timo Alley",
                            "Zc": "400 90",
                            "Lt": -76,
                            "Ln": -176,
                            "No": "7",
                            "Nd": "74",
                            "Ce": null
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                "Id": "203666",
                "Ul": "VVN",
                "Dsc": "Aut neque nihil.",
                "Plc": "Sunt eveniet tempore alias voluptas qui tempora enim dolores est voluptas porro qui qui laborum ullam ea unde veritatis quam.",
                "Rsn": "Ratione architecto at nam ipsa.",
                "St": "S",
                "OutagePeriods": {
                  "OutagePeriod": [
                    {
                      "BgP": "2022-09-15T00:00:00.000Z",
                      "EdP": "2022-09-30T00:00:00.000Z",
                      "Pst": null,
                      "Crsn": "adipisicing ut",
                      "Cdt": "2022-11-08T21:24:01.415Z"
                    }
                  ]
                },
                "Muns": {
                  "Mun": [
                    {
                      "BoxId": "nulla dolore voluptate",
                      "Ico": "00488500",
                      "Pods": {
                        "Pod": [
                          {
                            "P": "859182400180328275",
                            "I": "Duis",
                            "G": -20426818,
                            "C": "Cheyenne",
                            "Cp": "Bolingbrook",
                            "S": "Kyllikki Fork",
                            "Zc": "101 48",
                            "Lt": 18,
                            "Ln": -61,
                            "No": null,
                            "Nd": "4",
                            "Ce": null
                          },
                          {
                            "P": "859182400147272190",
                            "I": "in ad occaecat",
                            "G": -72994852,
                            "C": "Paradise",
                            "Cp": "Silver Spring",
                            "S": "Sami Dale",
                            "Zc": "614 59",
                            "Lt": 95,
                            "Ln": -21,
                            "No": "39",
                            "Nd": "27",
                            "Ce": null
                          },
                          {
                            "P": "859182400269730957",
                            "I": "officia occaecat et",
                            "G": 57621067,
                            "C": "Bethlehem",
                            "Cp": "Thornton",
                            "S": "Jari Circle",
                            "Zc": "575 54",
                            "Lt": -60,
                            "Ln": -19,
                            "No": "28",
                            "Nd": "8",
                            "Ce": null
                          },
                          {
                            "P": "859182400101166260",
                            "I": "voluptate",
                            "G": -43952511,
                            "C": "Grand Prairie",
                            "Cp": "Columbus",
                            "S": "Pirkko Pines",
                            "Zc": "671 18",
                            "Lt": -41,
                            "Ln": -110,
                            "No": "83",
                            "Nd": "7",
                            "Ce": null
                          },
                          {
                            "P": "859182400135611878",
                            "I": "Lorem do veniam proident",
                            "G": 74874442,
                            "C": "Eugene",
                            "Cp": "Maricopa",
                            "S": "Laitinen Road",
                            "Zc": "569 39",
                            "Lt": -122,
                            "Ln": 48,
                            "No": "3",
                            "Nd": "48",
                            "Ce": null
                          },
                          {
                            "P": "859182400147883683",
                            "I": "culpa veniam",
                            "G": -46751437,
                            "C": "Moline",
                            "Cp": "Fort Lauderdale",
                            "S": "Korhonen Forges",
                            "Zc": "798 26",
                            "Lt": 27,
                            "Ln": 58,
                            "No": null,
                            "Nd": null,
                            "Ce": "13"
                          },
                          {
                            "P": "859182400101692966",
                            "I": "in dolore occaecat",
                            "G": -26890249,
                            "C": "Peoria",
                            "Cp": "Port Arthur",
                            "S": "Hirvonen Corner",
                            "Zc": "783 88",
                            "Lt": -53,
                            "Ln": -99,
                            "No": null,
                            "Nd": "99",
                            "Ce": null
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          },
          "Returns": null
        }
      };

    const vec = reflection.reflectAndGenerate(json)

    expect(vec).toBeDefined()
    expect(test).toBeDefined()

    expect(json).toBeDefined()
  });
});
