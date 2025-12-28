export const useErrorParser = () => {
    const parseError = (error: any): { title: string, message: string } => {
        const defaultMessage = 'Terjadi kesalahan yang tidak terduga'
        const defaultTitle = 'Gagal'

        if (!error) {
            return { title: defaultTitle, message: defaultMessage }
        }

        // Handle Nuxt Fetch Errors
        if (error.response?._data) {
            const data = error.response._data

            // Common API error structures:
            // 1. { data: { message: "..." } } (Nest priority)
            // 2. { message: "..." }
            // 3. { errors: [ { message: "..." } ] }

            if (data.data?.message) {
                return { title: defaultTitle, message: data.data.message }
            }

            if (data.message && data.message !== 'Internal Server Error') {
                return { title: defaultTitle, message: data.message }
            }

            if (Array.isArray(data.errors) && data.errors.length > 0) {
                return { title: defaultTitle, message: data.errors[0].message || defaultMessage }
            }

            // Fallback if message is just "Internal Server Error" but no other details found,
            // or if structure didn't match above.
            if (data.message) {
                return { title: defaultTitle, message: data.message }
            }
        }

        // Handle standard JS Errors
        if (error.message) {
            return { title: defaultTitle, message: error.message }
        }

        return { title: defaultTitle, message: defaultMessage }
    }

    return {
        parseError
    }
}
