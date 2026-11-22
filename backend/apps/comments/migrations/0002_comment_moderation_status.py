from django.db import migrations, models


def copy_legacy_approval(apps, schema_editor):
    Comment = apps.get_model("comments", "Comment")
    Comment.objects.filter(is_approved=True).update(status="approved")
    Comment.objects.filter(is_approved=False).update(status="pending")


def reverse_copy(apps, schema_editor):
    Comment = apps.get_model("comments", "Comment")
    Comment.objects.filter(status="approved").update(is_approved=True)
    Comment.objects.exclude(status="approved").update(is_approved=False)


class Migration(migrations.Migration):
    dependencies = [("comments", "0001_initial")]
    operations = [
        migrations.AddField(
            model_name="comment", name="status",
            field=models.CharField(choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")], db_index=True, default="pending", max_length=10),
        ),
        migrations.RunPython(copy_legacy_approval, reverse_copy),
        migrations.AddIndex(
            model_name="comment",
            index=models.Index(fields=["publication", "status", "created_at"], name="comments_co_publica_d2113d_idx"),
        ),
    ]
