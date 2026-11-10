const guideData =[
    {
        guide:"Maximum 11 characters allowed",
        example:"UTILISMS",
        failureExample:"UTILISMS123"
    },
    {
        guide:"Letters(a-z, A-Z), numbers(0-9), and spaces are allowed ",
        example:"UTILISMS",
        failureExample:"UTILISMS!123"
    },
    {
        guide:"No Special Characters or Symbols",
        example:"UTILISMS",
        failureExample:"UTILISMS!123"
    },
    {
        guide:"Must at least contain one letter (cannot contain only numbers)",
        example:"UTILISMS123",
        failureExample:"1234567890",
    },
    {
        guide:"Use your business name or a a recognizable brand name",
        example:"UTILISMS",
        failureExample:"1234567890"
    },
    {
        guide:"Restricted: Cannot use telco names or bank service names or a status message",
        example:"UTILISMS",
        failureExample:"MTN/Telecel/AT/Access Bank etc."
    },
    {
        guide:"Restricted: Phrases like MTN, MoMo, Telecel Cash are not allowed"
    }
];

export default guideData;