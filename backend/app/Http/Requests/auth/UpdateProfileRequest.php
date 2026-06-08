<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name' => 'sometimes|string|min:2|max:80',
            'last_name'  => 'sometimes|string|min:2|max:80',
            'role'       => 'sometimes|string|in:admin,analyst,researcher,student,journalist,manager,other',
            'country'    => 'sometimes|string|max:80',
            'language'   => 'sometimes|string|in:fr,en,ar',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Données invalides.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
