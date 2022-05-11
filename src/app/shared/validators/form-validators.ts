import { FormGroup, FormControl } from '@angular/forms';

export function emailValidator(control: FormControl): {[key: string]: any} {
    var emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
    if (control.value && !emailRegexp.test(control.value.toLowerCase())) {
        return {invalidEmail: true};
    }
}

export function justLetterValidatorName(control: FormControl): {[key: string]: any} {
    const letterRegexp = /^[ñA-Za-z]*[ñA-Za-z][ñA-Za-z\s]*$/;
    if (control.value && !letterRegexp.test(control.value)) {
        return {invalidLetter: true};
    }
}

export function justComplexLettersValidator(control: FormControl): {[key: string]: any} {
    const letterRegexp = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/;
    if (control.value && !letterRegexp.test(control.value)) {
        return {invalidLetter: true};
    }
}

export function justLetterValidatorLastAndFirstName(control: FormControl): {[key: string]: any} {
    const letterRegexp = /^[ñA-Za-z]*[ñA-Za-z][ñA-Za-z\s]*$/;
    if (control.value && !letterRegexp.test(control.value)) {
        return {invalidLetter: true};
    }
}

export function justLetterValidator(control: FormControl): {[key: string]: any} {
    var letterRegexp = /^[ñA-Za-z]*[ñA-Za-z][ñA-Za-z]*$/;
    if (control.value && !letterRegexp.test(control.value)) {
        return {invalidLetter: true};
    }
}

export function justAlphanumericValidator(control: FormControl): {[key: string]: any} {
    var letterRegexp = /^[ña-z\d\s]+$/i;
    if (control.value && !letterRegexp.test(control.value)) {
        return {invalidLetter: true};
    }
}
export function numberValidator(control: FormControl): {[key: string]: any} {
    var numberRegexp = /^-?[\d.]+(?:e-?\d+)?$/;
    if (control.value && !numberRegexp.test(control.value)) {
        return {invalidNumber: true};
    }
}
export function checkIfHaveNumberValidator(control: FormControl): {[key: string]: any} {
    var oneNumberRegex = /\d/;
    if (control.value && !oneNumberRegex.test(control.value)) {
        return {dontHaveNumber: true};
    }
}
export function checkIfHaveUppercaseLetterValidator(control: FormControl): {[key: string]: any} {
    var oneUppercaseLetter = /[A-Z]/;
    if (control.value && !oneUppercaseLetter.test(control.value)) {
        return {dontHaveUppercaseLetter: true};
    }
}
export function selectAnOptionValidator(control: FormControl): {[key: string]: any} {
    if (control.value == null || control.value == '0') {
        return { optionNoSelected: true};
    }
}
export function mobileValidator(control: FormControl): {[key: string]: any} {
    if (control.value == null || control.value == '') {
        return { invalidNumber: true};
    } else {
        let length = control.value.length;
        if(length != 9) {
            return { invalidNumber: true};
        }
    }

}
export function checkedOptionValidator(control: FormControl): {[key: string]: any} {
    if (!control.value) {
        return { unchecked: true};
    }
}

export function matchingPasswords(password: string, repassword: string) {
    return (group: FormGroup) => {
        let passwordTemp= group.controls[password];
        let passwordConfirmation= group.controls[repassword];
        if (passwordTemp.value !== passwordConfirmation.value) {
            return passwordConfirmation.setErrors({mismatchedPasswords: true})
        }
    }
}
export function matchingEmails(email: string, confirmEmail: string) {
    return (group: FormGroup) => {
        let emailTemp= group.controls[email];
        let emailConfirmation= group.controls[confirmEmail];
        if (emailTemp.value !== emailConfirmation.value) {
            return emailConfirmation.setErrors({mismatchedEmails: true})
        }
    }
}


