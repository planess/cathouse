import { EmailIcon } from '@app/components/icons/registry-animal-e-ma-il-ic-on';
import { PhoneIcon } from '@app/components/icons/registry-animal-p-ho-ne-ic-on';
import { TelegramIcon } from '@app/components/icons/registry-animal-t-el-eg-ra-mi-co-n';

interface AvatarSocialsProps {
  shareTelegramUrl: string;
  shareEmailUrl: string;
}

export default function AvatarSocialsSection({
  shareTelegramUrl,
  shareEmailUrl,
}: AvatarSocialsProps) {
  return (
    <div className="flex justify-around gap-3 mt-3">
      <div className="w-8 h-8">
        <a
          href={shareTelegramUrl}
          target="_blank"
          className="flex-1 justify-center items-center text-[#5CACDD]"
        >
          <TelegramIcon />
        </a>
      </div>

      <div className="w-8 h-8">
        <a
          href="tel:+380973959022"
          className="flex-1 justify-center items-center text-[#625a65] dark:text-neutral-200 transition-colors"
          target="_blank"
        >
          <PhoneIcon />
        </a>
      </div>

      <div className="w-8 h-8">
        <a
          href={shareEmailUrl}
          className="flex-1 justify-center items-center text-[#71706b] dark:text-neutral-200 transition-colors"
          target="_blank"
        >
          <EmailIcon />
        </a>
      </div>
    </div>
  );
}
