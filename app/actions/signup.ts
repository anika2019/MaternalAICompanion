import { createClient } from '@/utils/supabase/client'
import { normalizePhone } from '@/utils/phone'

type SignupInput = {
  full_name: string
  age?: string
  phone_number: string
  pregnancy_week?: number
  trimester?: string
  health_conditions?: string
  diet_type?: string
}

export async function signUpUser(input: SignupInput) {
  const supabase = createClient()

  let formattedPhone = input.phone_number.trim()
  if (!formattedPhone.startsWith('+91')) {
    if (formattedPhone.startsWith('91') && formattedPhone.replace(/\D/g, '').length === 12) {
      formattedPhone = '+' + formattedPhone
    } else {
      formattedPhone = '+91' + formattedPhone
    }
  }

  const normalizedPhone = normalizePhone(formattedPhone)
  const dummyEmail = `${normalizedPhone}@dummy.com`
  const dummyPassword = 'DummyPassword123!@#'

  const { data, error } = await supabase.auth.signUp({
    email: dummyEmail,
    password: dummyPassword,
    options: {
      data: {
        full_name: input.full_name,
        age: input.age ?? null,
        phone_number: formattedPhone,
        pregnancy_week: input.pregnancy_week ?? null,
        trimester: input.trimester ?? null,
        health_conditions: input.health_conditions ?? null,
        diet_type: input.diet_type ?? null,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    return { success: false, error: error.message }
  }

  return {
    success: true,
  }
}
