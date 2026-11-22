
from django import forms
from .models import Literature


class LiteratureAdminForm(forms.ModelForm):

    class Meta:
        model = Literature

        fields = "__all__"

        widgets = {
            "title": forms.TextInput(attrs={
                "class": "literature-language-field",
                "dir": "ltr",
                "lang": "en",
            }),

            "excerpt": forms.Textarea(attrs={
                "class": "literature-language-field",
                "rows": 4,
                "dir": "ltr",
                "lang": "en",
            }),

            "content": forms.Textarea(attrs={
                "class": "literature-language-field literature-content-editor",
                "rows": 18,
                "dir": "ltr",
                "lang": "en",
            }),
        }
