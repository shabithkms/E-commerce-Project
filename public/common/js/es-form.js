document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.es-form').forEach(function (eachForm) {
        var formId = eachForm.getAttribute('id')
        if (!formId) {
            var newId = 'io_' + Math.random().toString(36).substring(2, 7)
            eachForm.id = newId
        }
    })

    function showErrors(result, formId) {
        if (result.details) {
            // Looping through each validation error response
            for (const index in result.details) {
                // console.log(result.details[index].path)
                let field_key = result.details[index].path[0]
                let field_error_message_id = result.details[index].path[0]
                if (result.details[index].path.length > 1) {
                    result.details[index].path.forEach((key, index) => {
                        if (index != 0) {
                            field_key = `${field_key}[${key}]`
                            field_error_message_id = `${field_error_message_id}_${key}`
                        }
                    })
                }

                // console.log(field_key)
                console.log(field_error_message_id)

                if (
                    document.querySelector(`#${formId} [name="${field_key}"]`)
                ) {
                    document
                        .querySelector(`#${formId} [name="${field_key}"`)
                        .classList.add('is-invalid')
                }

                if (
                    document.querySelector(
                        `#${formId} [id="field-error-${field_error_message_id}"]`
                    )
                ) {
                    document
                        .querySelector(
                            `#${formId} [id="field-error-${field_error_message_id}"]`
                        )
                        .classList.add('d-inline')
                    document
                        .querySelector(
                            `#${formId} [id="field-error-${field_error_message_id}"]`
                        )
                        .classList.remove('d-none')
                    document.querySelector(
                        `#${formId} [id="field-error-${field_error_message_id}"]`
                    ).innerHTML = result.details[index].message
                }
            }
        }
    }

    async function formSave(form, url, pageRefresh, callback) {
        form.querySelectorAll('.invalid-feedback').forEach(function (
            invalidFieldMessage
        ) {
            // console.log(invalidFieldMessage)
            invalidFieldMessage.innerHtml = ''
            invalidFieldMessage.classList.remove('d-inline')
            invalidFieldMessage.classList.add('d-none')
        })
        form.querySelectorAll('.is-invalid').forEach(function (invalidField) {
            invalidField.classList.remove('is-invalid')
        })

        if (form.querySelector('#slug_field')) {
            form.querySelector('#slug_field').disabled = false
        }

        // Converting the form data to JSON for validation purpose
        let sendData = FormDataJson.toJson(
            document.querySelector(`#${form.getAttribute('id')}`)
        )
        let formData = new FormData()
        let images = {}
        let options = {}

        document
            .querySelectorAll(`#${form.getAttribute('id')} input[type=file]`)
            .forEach((e, i) => {
                // If file is empty creating the field with field name and lang
                if (e?.name && !e?.files.length) {
                    let name = e.name.split('.')[0]
                    let lang = e.name.split('.')[1]
                    if (lang) {
                        formData.append(`${name}[${lang}]`, '')
                        images[name] = { ...images[name] }
                    } else {
                        formData.append(`${name}`, '')
                        images[name] = { ...images[name] }
                    }
                }
                // If file is present then appending the file to form data
                if (e?.files.length) {
                    let name = e.name.split('.')[0]
                    let lang = e.name.split('.')[1]
                    if (lang) {
                        // Appending the image
                        formData.append(`${name}.${lang}`, e.files[0])
                        // Appending the image field for validation purpose
                        formData.append(
                            `${name}[${lang}]`,
                            e.files[0] ? e.files[0].name : 'image_name'
                        )
                        images[name] = { ...images[name], [lang]: e.files[0] }
                    } else {
                        // Appending the image
                        formData.append(`${name}`, e.files[0])
                        // Appending the image field for validation purpose
                        formData.append(
                            `${name}`,
                            e.files[0] ? e.files[0].name : 'image_name'
                        )
                        images[name] = { ...images, [lang]: e.files[0] }
                    }
                }
            })
        // console.log(sendData)
        // console.log(images)
        if (Object.keys(images)?.length > 0) {
            // Creating form data with json
            for (let key in sendData) {
                if (typeof sendData[key] == 'object') {
                    // append nested object
                    for (let nestedKey in sendData[key]) {
                        formData.append(
                            `${key}[${nestedKey}]`,
                            sendData[key][nestedKey]
                        )
                    }
                } else {
                    formData.append(key, sendData[key])
                }
            }
            // Fetch options
            options = {
                method: 'POST',
                body: formData,
            }
        } else {
            // Fetch options
            options = {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sendData),
            }
        }
        fetch(url, options)
            .then(async (res) => {
                var resStatus = res.status
                var data = await res.json()
                if (resStatus >= 200 && resStatus < 300) {
                    // toastr.success('Data saved', 'Done!');
                    document.getElementById(form.getAttribute('id')).reset()
                    var redirect_url = form.getAttribute('data-kt-redirect-url')
                    Swal.fire({
                        text: data?.message || 'success',
                        icon: 'success',
                        buttonsStyling: !1,
                        confirmButtonText: 'Ok, got it!',
                        customClass: { confirmButton: 'btn btn-primary' },
                    }).then(function (t) {
                        if (t.isConfirmed) {
                            redirect_url && (location.href = redirect_url)
                        }
                    })
                    // if (redirect_url) {
                    //     window.location.href = data.redirect_url
                    // } else
                    if (data.redirect_to) {
                        window.location.href = data.redirect_to
                    } else if (callback) {
                        window.location.href = callback
                    } else if (pageRefresh) {
                        location.reload()
                    }
                } else if (resStatus == 422) {
                    console.log(data.details)
                    Swal.fire({
                        text: 'You must fill out the form before moving forward',
                        icon: 'error',
                        buttonsStyling: !1,
                        confirmButtonText: 'Ok, got it!',
                        customClass: { confirmButton: 'btn btn-primary' },
                    })
                    showErrors(data, form.getAttribute('id'))
                } else {
                    Swal.fire({
                        text: data.error || 'Something went wrong',
                        icon: 'error',
                        buttonsStyling: !1,
                        confirmButtonText: 'Ok, got it!',
                        customClass: { confirmButton: 'btn btn-primary' },
                    })
                }
                if (form.querySelector('#slug_field')) {
                    form.querySelector('#slug_field').disabled = true
                }
                form.querySelector('.form-submit-btn').disabled = false
                form.querySelector('.form-submit-btn .label').classList.remove(
                    'd-none'
                )
                form.querySelector('.form-submit-btn .preloader').classList.add(
                    'd-none'
                )
            })
            .catch((err) => {
                console.log(err)
                if (form.querySelector('#slug_field')) {
                    form.querySelector('#slug_field').disabled = true
                }
                form.querySelector('.form-submit-btn').disabled = false
                form.querySelector('.form-submit-btn .label').classList.remove(
                    'd-none'
                )
                form.querySelector('.form-submit-btn .preloader').classList.add(
                    'd-none'
                )
                Swal.fire({
                    text: 'Something went wrong',
                    icon: 'error',
                    buttonsStyling: !1,
                    confirmButtonText: 'Ok, got it!',
                    customClass: { confirmButton: 'btn btn-primary' },
                })
                // console.log(JSON.stringify(err))
            })
    }

    document.querySelectorAll('.es-form').forEach(function (sourceForm) {
        sourceForm.addEventListener('submit', function (e) {
            e.preventDefault()
            sourceForm.querySelector('.form-submit-btn').disabled = true
            sourceForm
                .querySelector('.form-submit-btn .label')
                .classList.add('d-none')
            sourceForm
                .querySelector('.form-submit-btn .preloader')
                .classList.remove('d-none')
            var form = document.querySelector(
                '#' + sourceForm.getAttribute('id')
            )
            var url = form.action
            var pageRefresh = form.getAttribute('data-success-refresh') || false
            var callback = form.getAttribute('callback')
                ? form.getAttribute('callback')
                : false
            // console.log({ form, url, pageRefresh, callback })
            formSave(form, url, pageRefresh, callback)
        })
    })
})
