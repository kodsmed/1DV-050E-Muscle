import { UserDetails } from "functions/getUserDetails";
import { Avatar } from "../catalyst/avatar";
import { Field, FieldGroup, Label } from "../catalyst/fieldset";
import { Button } from "../catalyst/button";
import { Input } from "../catalyst/input";
import { useState } from 'react';
import { Form } from "@remix-run/react";
import { Text } from "../catalyst/text";


export function ProfileForm({ userDetails }: { userDetails: UserDetails | null }) {
  let isDefault = false;
  if (!userDetails) {
    isDefault = true
    userDetails = {
      avatarUrl: "https://gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50.jpg",
      firstName: "Firstname",
      lastName: "Sirname",
      displayName: "Placeholder username",
      currentWeight: 0,
      targetWeight: 0
    };
  }
  const [avatarUrl, setAvatarUrl] = useState(userDetails.avatarUrl);
  const [displayName, setDisplayName] = useState(userDetails.displayName);
  const [firstName, setFirstName] = useState(userDetails.firstName);
  const [lastName, setLastName] = useState(userDetails.lastName);
  const [currentWeight, setCurrentWeight] = useState(userDetails.currentWeight);
  const [targetWeight, setTargetWeight] = useState(userDetails.targetWeight);

  function updateCurrentWeight(newWeight: number) {
    if (newWeight < 0) {
      newWeight = 0;
    }
    if (newWeight > 650) {
      newWeight = 650;
    }

    setCurrentWeight(newWeight);
  }

  function updateTargetWeight(newWeight: number) {
    if (newWeight < 0) {
      newWeight = 0;
    }
    if (newWeight > 650) {
      newWeight = 650;
    }
    setTargetWeight(newWeight);
  }

  return (
    <div className="flex flex-col items-center mt-8 space-y-4">
      <Form action="/profile" method="post">
        <input type="hidden" name="default" value={isDefault ? 'true' : 'false'} />
        {isDefault && <Text className="text-center font-bold mb-4">It appears you do not have a profile, please provide your information below</Text>}
        <div className="flex flex-col items-center w-fit bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between space-x-4 w-[32rem]">
            <Avatar
              src={avatarUrl}
              initials={''}
              alt={firstName + ' ' + lastName}
            />
            <FieldGroup>
              <Field>
                <Label>Avatar URL</Label>
                <Input className="w-96" type="text" name="avatarUrl" value={avatarUrl} onChange={(event) => { setAvatarUrl(event.target.value) }}>
                </Input>
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="flex flex-col items-center w-fit bg-white rounded-lg shadow-md p-4 pt-4">
          <div className="flex justify-between space-x-4 w-[32rem] truncate">
            <FieldGroup>
              <h1 className="text-2xl font-semibold mt-4">
                {displayName}
              </h1>
              <Field>
                <Label>Display Name</Label>
                <Input className="w-96" type="text" name="displayName" maxLength={32} value={
                  displayName
                } onChange={(event) => { setDisplayName(event.target.value) }}>
                </Input>
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="flex flex-col items-center w-fit bg-white rounded-lg shadow-md p-4 pt-4">
          <div className="flex justify-between space-x-4 w-[32rem] truncate">
            <FieldGroup>
              <h1 className="text-2xl font-semibold mt-4">
                {firstName} {lastName}
              </h1>
              <Field>
                <Label>First name</Label>
                <Input className="w-96" type="text" name="firstName" maxLength={128} value={firstName} onChange={(event) => { setFirstName(event.target.value) }}>
                </Input>
              </Field>
              <Field>
                <Label>Sir name</Label>
                <Input className="w-96" type="text" name="lastName" maxLength={128} value={lastName} onChange={(event) => { setLastName(event.target.value) }}>
                </Input>
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="flex flex-col items-center w-fit bg-white rounded-lg shadow-md p-4 pt-4">
          <div className="w-[32rem]">
            <FieldGroup>
              <h1 className="text-2xl font-semibold mt-4">
                Weight
              </h1>
              <Field>
                <Label>Current Weight</Label>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight - 1) }}>-1</Button>
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight - 5) }}>-5</Button>
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight - 10) }}>-10</Button>
                  </div>
                  <div className="grow flex justify-center items-center">
                    <p>{currentWeight} kg</p>
                    <input type="hidden" name="currentWeight" value={currentWeight.toString()} />
                  </div>
                  <div className="flex space-x-1">
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight + 10) }}>+10</Button>
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight + 5) }}>+5</Button>
                    <Button className="w-10" onClick={() => { updateCurrentWeight(currentWeight + 1) }}>+1</Button>
                  </div>
                </div>
              </Field>
              <Field>
                <Label>Target Weight</Label>
                <div className="flex justify-between items-center w-full">
                  <div className="flex space-x-1">
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight - 1) }}>-1</Button>
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight - 5) }}>-5</Button>
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight - 10) }}>-10</Button>
                  </div>
                  <p>{targetWeight} kg</p>
                  <input type="hidden" name="targetWeight" value={targetWeight.toString()} />
                  <div className="flex space-x-1">
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight + 10) }}>+10</Button>
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight + 5) }}>+5</Button>
                    <Button className="w-10" onClick={() => { updateTargetWeight(targetWeight + 1) }}>+1</Button>
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div className="flex flex-col items-center w-fit p-4 pt-4">
          <div className="w-[32rem]">
            <Button className="w-[32rem] mb-8" type="submit">Save</Button>
          </div>
        </div>
      </Form>
    </div>
  );
}