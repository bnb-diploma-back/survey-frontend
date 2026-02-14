const BASE_URL = 'http://localhost:8070'

/**
 * Map frontend gender label to API enum (SaveRequest.gender).
 * @param {string} displayGender - "Male" | "Female" | "Prefer not to say"
 * @returns {string|null} "MALE" | "FEMALE" | "PREFER_NOT_TO_SAY" | null
 */
export function genderToApiEnum(displayGender) {
  if (!displayGender) return null
  const map = {
    Male: 'MALE',
    Female: 'FEMALE',
    'Prefer not to say': 'PREFER_NOT_TO_SAY'
  }
  return map[displayGender] ?? null
}

/**
 * Save survey (POST /survey).
 * Request body must match SaveRequest: { age?, gender?, averageScreenTime?, questions: SurveyQuestion[] }
 * @param {Object} body - SaveRequest
 * @param {number|null} body.age - integer
 * @param {string|null} body.gender - "MALE" | "FEMALE" | "PREFER_NOT_TO_SAY"
 * @param {number|null} body.averageScreenTime - double
 * @param {Array<{question: string, answer: string}>} body.questions
 * @returns {Promise<{uuid: string}>} SaveResponse
 */
export async function saveSurvey(body) {
  // Build a plain object so JSON.stringify never sees a Vue Proxy or non-JSON values
  const payload = {
    ...(body?.age != null && { age: body.age }),
    ...(body?.gender != null && body?.gender !== '' && { gender: body.gender }),
    ...(body?.averageScreenTime != null && { averageScreenTime: body.averageScreenTime }),
    questions: Array.isArray(body?.questions)
      ? body.questions.map((q) => ({ question: q.question, answer: q.answer ?? '' }))
      : []
  }
  let bodyStr
  try {
    bodyStr = JSON.stringify(payload)
  } catch (e) {
    throw new Error('Survey payload could not be serialized: ' + (e?.message ?? e))
  }
  const res = await fetch(`${BASE_URL}/survey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: bodyStr
  })
  if (!res.ok) {
    let message = `Survey save failed: ${res.status}`
    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {}
    if (data?.message) message += ` - ${data.message}`
    else if (data?.error) message += ` - ${data.error}`
    else if (data?.errors) message += ` - ${JSON.stringify(data.errors)}`
    else if (text) message += ` - ${text}`
    throw new Error(message)
  }
  return res.json()
}

/**
 * Get survey result by id (GET /survey/{id}).
 * @param {string} id - UUID
 * @returns {Promise<SurveyResponse>}
 */
export async function getSurveyById(id) {
  const res = await fetch(`${BASE_URL}/survey/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('No results found for this ID. Please check and try again.')
    }
    let message = 'Failed to load results. Please try again.'
    try {
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (data?.message && typeof data.message === 'string') {
        message = data.message
      }
    } catch {}
    throw new Error(message)
  }
  return res.json()
}
