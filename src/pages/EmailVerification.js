import React, { useState } from "react";
import { Box, Flex, Button, Text, IconField, Link } from "@blend-ui/core";

import bxKey from "@iconify/icons-bx/bx-key";
import { ReactComponent as Email } from "../assets/email-envelope.svg";

import ProgressContainer from "../components/ProgressContainer";
import { useFormFields } from "../lib/formFields";

import { onlyDigitChars } from "../lib/utils";
import { UseFocus } from "../lib/componentUtils";
import Amplify, { API } from "aws-amplify";
import { useAppContext } from "../lib/contextLib";
import { verifyCodeMutation } from "../graphql/api";
//import { useHistory } from "react-router-dom";

import i18n from "../lib/i18n";
i18n.init();

const EmailVerification = ({
  invalidLink,
  currentUser,
  nextStep,
  ...props
}) => {
  //console.log("Phone ", props);
  //const history = useHistory();
  const { APIConfig } = useAppContext();
  Amplify.configure(APIConfig);
  console.log("USER ", currentUser);

  const [verificationFields, _handleChange] = useFormFields({
    verificationCode: "",
  });
  const [inputCode, setInputCodeFocus] = UseFocus();
  const [inputError, setInputError] = useState({ status: false, msg: "" });

  const checkInput = (code) => {
    const checkResult = onlyDigitChars(code);
    //console.log(checkResult);
    let validCode = true;
    if (!checkResult) {
      setInputError({ status: true, msg: i18n.__("codeDigitsError") });
      validCode = false;
    }
    if (code.length > 1 && code.length !== 6) {
      setInputError({ status: true, msg: i18n.__("codeLengthError") });
      validCode = false;
    }
    if (validCode) {
      setInputError({ status: false, msg: "" });
    }
  };
  const verifyClick = async (e) => {
    try {
      const result = await verifyCodeMutation(
        API,
        [
          currentUser.username,
          currentUser.client,
          "email",
          verificationFields.verificationCode,
        ].join("#")
      );
      console.log(result);

      //{data:{},errors:[]}
      //s.errors[0].message
      //onAction("phone");
      //history.replace("/verify-phone");
      nextStep(3);
    } catch (e) {
      console.log("ERR", e);
      setInputError({ status: true, msg: i18n.__("invalidCode") });
      /*
      data:
verifyCode: null

      errors: Array(1)
0:
data: null
errorInfo: null
errorType: null
locations: [{…}]
message: "INVALID_CODE"
path: ["verifyCode"]
*/
    }
    //e.preventDefault();
  };
  return (
    <ProgressContainer
      title={i18n.__("verificationTitle")}
      progress={100}
      pr={19}
    >
      <Box mt={50}>
        <Box display={"inline-flex"}>
          <Box>
            <Email height={"105px"} width={"95px"} />
          </Box>
          <Box ml={34}>
            <Box>
              <Text textStyle={"h6"}>{i18n.__("emailVerificationTitle")}</Text>
            </Box>
            <Box mt={5}>
              <Text textStyle={"caption2"} as={"p"} m={0}>
                {i18n.__("emailVerificationText")}
              </Text>
            </Box>
            <Box mt={15}>
              <IconField width={"200px"}>
                <IconField.LeftIcon
                  iconify={bxKey}
                  color={"componentPrimary"}
                  size={"17"}
                />
                <IconField.InputField
                  placeholder={i18n.__("codePropmt")}
                  id={"verificationCode"}
                  name={"verificationCode"}
                  onChange={(e) => {
                    _handleChange(e);
                    checkInput(e.target.value);
                  }}
                  errorMsg={inputError.msg}
                  error={inputError.status}
                  ref={inputCode}
                />
              </IconField>
            </Box>
            <Box mt={inputError.status ? 0 : 3} display={"inline-flex"}>
              <Flex alignItems={"center"}>
                <Text textStyle={"caption2"} mr={5}>
                  {i18n.__("emailMissing")}
                </Text>
                <Link href={invalidLink} target="_blank" fontSize={"10px"}>
                  {i18n.__("sendAgainLinkText")}
                </Link>
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>
      {/*            
      <Box mt={inputError.status ? 50 : 80} display={"inline-flex"}>
        <Flex>
          <Button variation={"outline"}>{i18n.__("backButton")}</Button>
        </Flex>
        <Flex ml={99}>
          <Button
            disabled={inputError.status || fields.verificationCode.length !== 6}
          >
            {i18n.__("verifyButton")}
          </Button>
        </Flex>
      </Box>
      */}
      <Box mt={inputError.status ? 53 : 80} textAlign={"center"}>
        <Button
          disabled={
            inputError.status ||
            verificationFields.verificationCode.length !== 6
          }
          onClick={verifyClick}
        >
          {i18n.__("verifyButton")}
        </Button>
      </Box>
    </ProgressContainer>
  );
};

export default EmailVerification;
